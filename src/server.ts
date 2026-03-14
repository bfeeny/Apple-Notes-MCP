import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerNoteTools } from "./tools/notes.js";
import { registerFolderTools } from "./tools/folders.js";
import { registerSearchTools } from "./tools/search.js";
import { registerAccountTools } from "./tools/accounts.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "apple-notes",
    version: "0.1.0",
  });

  registerNoteTools(server);
  registerFolderTools(server);
  registerSearchTools(server);
  registerAccountTools(server);

  return server;
}
