import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runAppleScript } from "../applescript/runner.js";
import { searchNotesScript } from "../applescript/scripts/search.js";
import { toNoteSummaries } from "../utils/parse.js";

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true as const };
}

export function registerSearchTools(server: McpServer): void {
  server.tool(
    "search_notes",
    "Search notes by name or content",
    {
      query: z.string().describe("Search query — matches against note name and content"),
      limit: z.number().optional().default(20).describe("Max results to return"),
    },
    async ({ query, limit }) => {
      const result = await runAppleScript(searchNotesScript(query, limit));
      if (!result.success) return errorResult(result.error!);
      if (!result.output) return { content: [{ type: "text", text: "No matching notes found." }] };

      const notes = toNoteSummaries(result.output);
      const text = notes
        .map((n) => `- **${n.name}** (${n.folder}) — modified ${n.modifiedDate}`)
        .join("\n");
      return { content: [{ type: "text", text }] };
    }
  );
}
