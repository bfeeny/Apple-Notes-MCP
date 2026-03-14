import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runAppleScript } from "../applescript/runner.js";
import { listFoldersScript, createFolderScript } from "../applescript/scripts/folders.js";
import { toFolderSummaries, parseFields } from "../utils/parse.js";

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true as const };
}

export function registerFolderTools(server: McpServer): void {
  server.tool(
    "list_folders",
    "List all folders in Apple Notes",
    {
      account: z.string().optional().describe("Filter folders by account name"),
    },
    async ({ account }) => {
      const result = await runAppleScript(listFoldersScript(account));
      if (!result.success) return errorResult(result.error!);
      if (!result.output) return { content: [{ type: "text", text: "No folders found." }] };

      const folders = toFolderSummaries(result.output);
      const text = folders
        .map((f) => `- **${f.name}** (${f.noteCount} notes)`)
        .join("\n");
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "create_folder",
    "Create a new folder in Apple Notes",
    {
      name: z.string().describe("Name of the folder to create"),
      account: z.string().optional().describe("Account to create the folder in"),
    },
    async ({ name, account }) => {
      const result = await runAppleScript(createFolderScript(name, account));
      if (!result.success) return errorResult(result.error!);

      const [id, folderName] = parseFields(result.output);
      return { content: [{ type: "text", text: `Created folder "${folderName}" (id: ${id})` }] };
    }
  );
}
