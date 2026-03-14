#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// --- AppleScript helpers ---

async function runAppleScript(script: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("osascript", ["-e", script]);
    return stdout.trim();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown AppleScript error";
    throw new Error(`AppleScript error: ${message}`);
  }
}

function escapeAppleScriptString(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

// --- Tool implementations ---

async function listNotes(
  folder?: string,
  limit: number = 20
): Promise<string> {
  let script: string;

  if (folder) {
    const escapedFolder = escapeAppleScriptString(folder);
    script = `
      tell application "Notes"
        set noteList to {}
        set targetFolder to folder "${escapedFolder}"
        set noteItems to notes of targetFolder
        set maxCount to ${limit}
        if (count of noteItems) < maxCount then set maxCount to (count of noteItems)
        repeat with i from 1 to maxCount
          set n to item i of noteItems
          set end of noteList to (name of n) & "\t" & (name of container of n)
        end repeat
        return noteList as text
      end tell
    `;
  } else {
    script = `
      tell application "Notes"
        set noteList to {}
        set noteItems to notes
        set maxCount to ${limit}
        if (count of noteItems) < maxCount then set maxCount to (count of noteItems)
        repeat with i from 1 to maxCount
          set n to item i of noteItems
          set end of noteList to (name of n) & "\t" & (name of container of n)
        end repeat
        return noteList as text
      end tell
    `;
  }

  const result = await runAppleScript(script);
  if (!result) return "No notes found.";

  const lines = result.split(", ");
  const formatted = lines.map((line) => {
    const [name, container] = line.split("\t");
    return `• ${name} (${container || "Notes"})`;
  });

  return formatted.join("\n");
}

async function getNoteContent(
  noteName: string,
  folder?: string
): Promise<string> {
  const escapedName = escapeAppleScriptString(noteName);

  let script: string;
  if (folder) {
    const escapedFolder = escapeAppleScriptString(folder);
    script = `
      tell application "Notes"
        set targetFolder to folder "${escapedFolder}"
        set targetNote to first note of targetFolder whose name is "${escapedName}"
        return plaintext of targetNote
      end tell
    `;
  } else {
    script = `
      tell application "Notes"
        set targetNote to first note whose name is "${escapedName}"
        return plaintext of targetNote
      end tell
    `;
  }

  return await runAppleScript(script);
}

async function addNote(
  name: string,
  content: string,
  folder: string = "Notes"
): Promise<string> {
  const escapedName = escapeAppleScriptString(name);
  const escapedContent = escapeAppleScriptString(content);
  const escapedFolder = escapeAppleScriptString(folder);

  const script = `
    tell application "Notes"
      set targetFolder to folder "${escapedFolder}"
      make new note at targetFolder with properties {name:"${escapedName}", body:"${escapedContent}"}
      return "Note created: ${escapedName} in ${escapedFolder}"
    end tell
  `;

  return await runAppleScript(script);
}

async function updateNoteContent(
  noteName: string,
  newContent: string,
  folder?: string
): Promise<string> {
  const escapedName = escapeAppleScriptString(noteName);
  const escapedContent = escapeAppleScriptString(newContent);

  let script: string;
  if (folder) {
    const escapedFolder = escapeAppleScriptString(folder);
    script = `
      tell application "Notes"
        set targetFolder to folder "${escapedFolder}"
        set targetNote to first note of targetFolder whose name is "${escapedName}"
        set body of targetNote to "${escapedContent}"
        return "Updated note: ${escapedName}"
      end tell
    `;
  } else {
    script = `
      tell application "Notes"
        set targetNote to first note whose name is "${escapedName}"
        set body of targetNote to "${escapedContent}"
        return "Updated note: ${escapedName}"
      end tell
    `;
  }

  return await runAppleScript(script);
}

// --- MCP Server setup ---

const server = new McpServer({
  name: "apple-notes",
  version: "0.1.0",
});

server.tool(
  "list_notes",
  "List notes from Apple Notes, optionally filtered by folder",
  {
    folder: z
      .string()
      .optional()
      .describe("Folder name to filter notes (e.g., 'Notes', 'Work')"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Maximum number of notes to return (default: 20)"),
  },
  async ({ folder, limit }) => {
    try {
      const result = await listNotes(folder, limit);
      return { content: [{ type: "text", text: result }] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

server.tool(
  "get_note_content",
  "Get the content of a specific note by its name",
  {
    note_name: z.string().describe("Name of the note to retrieve"),
    folder: z
      .string()
      .optional()
      .describe("Folder where the note is located"),
  },
  async ({ note_name, folder }) => {
    try {
      const result = await getNoteContent(note_name, folder);
      return { content: [{ type: "text", text: result }] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

server.tool(
  "add_note",
  "Create a new note in Apple Notes",
  {
    name: z.string().describe("Title of the new note"),
    content: z.string().describe("Content of the new note"),
    folder: z
      .string()
      .optional()
      .default("Notes")
      .describe("Folder to create the note in (default: 'Notes')"),
  },
  async ({ name, content, folder }) => {
    try {
      const result = await addNote(name, content, folder);
      return { content: [{ type: "text", text: result }] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

server.tool(
  "update_note_content",
  "Update the content of an existing note",
  {
    note_name: z.string().describe("Name of the note to update"),
    new_content: z.string().describe("New content for the note"),
    folder: z
      .string()
      .optional()
      .describe("Folder where the note is located"),
  },
  async ({ note_name, new_content, folder }) => {
    try {
      const result = await updateNoteContent(note_name, new_content, folder);
      return { content: [{ type: "text", text: result }] };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
    }
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Apple Notes MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
