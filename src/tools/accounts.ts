import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runAppleScript } from "../applescript/runner.js";
import { listAccountsScript } from "../applescript/scripts/accounts.js";
import { toAccountSummaries } from "../utils/parse.js";

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true as const };
}

export function registerAccountTools(server: McpServer): void {
  server.tool(
    "list_accounts",
    "List all accounts configured in Apple Notes",
    {},
    async () => {
      const result = await runAppleScript(listAccountsScript());
      if (!result.success) return errorResult(result.error!);
      if (!result.output) return { content: [{ type: "text", text: "No accounts found." }] };

      const accounts = toAccountSummaries(result.output);
      const text = accounts.map((a) => `- **${a.name}** (${a.id})`).join("\n");
      return { content: [{ type: "text", text }] };
    }
  );
}
