import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runAppleScript } from "../applescript/runner.js";
import {
  listNotesScript,
  getNoteScript,
  createNoteScript,
  updateNoteScript,
  deleteNoteScript,
  appendToNoteScript,
  duplicateNoteScript,
  moveNoteScript,
  exportNoteScript,
} from "../applescript/scripts/notes.js";
import { toNoteSummaries, toNoteDetail, parseFields } from "../utils/parse.js";
import { htmlToText } from "../utils/html-to-text.js";

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true as const };
}

export function registerNoteTools(server: McpServer): void {
  // --- Phase 1: Core CRUD ---

  server.tool(
    "list_notes",
    "List notes from Apple Notes, optionally filtered by folder",
    {
      folder: z.string().optional().describe("Folder name to filter notes"),
      limit: z.number().optional().default(20).describe("Max notes to return (default: 20)"),
    },
    async ({ folder, limit }) => {
      const result = await runAppleScript(listNotesScript(folder, limit));
      if (!result.success) return errorResult(result.error!);
      if (!result.output) return { content: [{ type: "text", text: "No notes found." }] };

      const notes = toNoteSummaries(result.output);
      const text = notes
        .map((n) => `- **${n.name}** (${n.folder}) — modified ${n.modifiedDate}`)
        .join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "get_note",
    "Get the full content and metadata of a note by name",
    {
      name: z.string().describe("Name of the note to retrieve"),
      folder: z.string().optional().describe("Folder the note is in"),
    },
    async ({ name, folder }) => {
      const result = await runAppleScript(getNoteScript(name, folder));
      if (!result.success) return errorResult(result.error!);

      const note = toNoteDetail(result.output);
      const text = [
        `**${note.name}**`,
        `Folder: ${note.folder}`,
        `Created: ${note.createdDate}`,
        `Modified: ${note.modifiedDate}`,
        `Password protected: ${note.passwordProtected}`,
        "",
        note.plaintext,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "create_note",
    "Create a new note in Apple Notes",
    {
      name: z.string().describe("Title of the new note"),
      content: z.string().describe("Content of the new note"),
      folder: z.string().optional().default("Notes").describe("Folder to create the note in"),
    },
    async ({ name, content, folder }) => {
      const result = await runAppleScript(createNoteScript(name, content, folder));
      if (!result.success) return errorResult(result.error!);

      const [id, noteName] = parseFields(result.output);
      return { content: [{ type: "text", text: `Created note "${noteName}" (id: ${id})` }] };
    }
  );

  server.tool(
    "update_note",
    "Replace the content of an existing note",
    {
      name: z.string().describe("Name of the note to update"),
      content: z.string().describe("New content for the note"),
      folder: z.string().optional().describe("Folder the note is in"),
    },
    async ({ name, content, folder }) => {
      const result = await runAppleScript(updateNoteScript(name, content, folder));
      if (!result.success) return errorResult(result.error!);

      const [id, noteName] = parseFields(result.output);
      return { content: [{ type: "text", text: `Updated note "${noteName}" (id: ${id})` }] };
    }
  );

  server.tool(
    "delete_note",
    "Delete a note from Apple Notes (moves to Recently Deleted)",
    {
      name: z.string().describe("Name of the note to delete"),
      folder: z.string().optional().describe("Folder the note is in"),
    },
    async ({ name, folder }) => {
      const result = await runAppleScript(deleteNoteScript(name, folder));
      if (!result.success) return errorResult(result.error!);
      return { content: [{ type: "text", text: result.output }] };
    }
  );

  // --- Phase 2: Organization ---

  server.tool(
    "move_note",
    "Move a note to a different folder",
    {
      name: z.string().describe("Name of the note to move"),
      target_folder: z.string().describe("Destination folder name"),
      source_folder: z.string().optional().describe("Current folder of the note"),
    },
    async ({ name, target_folder, source_folder }) => {
      const result = await runAppleScript(moveNoteScript(name, target_folder, source_folder));
      if (!result.success) return errorResult(result.error!);

      const [id, noteName] = parseFields(result.output);
      return { content: [{ type: "text", text: `Moved "${noteName}" to ${target_folder}` }] };
    }
  );

  // --- Phase 3: Export ---

  server.tool(
    "export_note",
    "Export a note's full content including HTML body",
    {
      name: z.string().describe("Name of the note to export"),
      folder: z.string().optional().describe("Folder the note is in"),
      format: z.enum(["html", "text"]).optional().default("text").describe("Export format"),
    },
    async ({ name, folder, format }) => {
      const result = await runAppleScript(exportNoteScript(name, folder));
      if (!result.success) return errorResult(result.error!);

      // exportNoteScript returns: id|noteName|created|modified|body
      // Body is last so splitting on FIELD_SEP with a limit keeps body intact.
      const [id, noteName, created, modified, ...bodyParts] = parseFields(result.output);
      const htmlBody = bodyParts.join("\x1C"); // rejoin in case body had stray FS chars
      const body = format === "html" ? htmlBody : htmlToText(htmlBody || "");
      const text = [
        `# ${noteName}`,
        `ID: ${id}`,
        `Created: ${created}`,
        `Modified: ${modified}`,
        "",
        body,
      ].join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  // --- Phase 4: Convenience ---

  server.tool(
    "append_to_note",
    "Append content to the end of an existing note",
    {
      name: z.string().describe("Name of the note to append to"),
      content: z.string().describe("Content to append"),
      folder: z.string().optional().describe("Folder the note is in"),
    },
    async ({ name, content, folder }) => {
      const result = await runAppleScript(appendToNoteScript(name, content, folder));
      if (!result.success) return errorResult(result.error!);

      const [id, noteName] = parseFields(result.output);
      return { content: [{ type: "text", text: `Appended to "${noteName}" (id: ${id})` }] };
    }
  );

  server.tool(
    "duplicate_note",
    "Duplicate a note, optionally into a different folder",
    {
      name: z.string().describe("Name of the note to duplicate"),
      target_folder: z.string().optional().describe("Folder for the copy (default: same folder)"),
      source_folder: z.string().optional().describe("Folder the original is in"),
    },
    async ({ name, target_folder, source_folder }) => {
      const result = await runAppleScript(duplicateNoteScript(name, target_folder, source_folder));
      if (!result.success) return errorResult(result.error!);

      const [id, noteName] = parseFields(result.output);
      return { content: [{ type: "text", text: `Duplicated as "${noteName}" (id: ${id})` }] };
    }
  );
}
