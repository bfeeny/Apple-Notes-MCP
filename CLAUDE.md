# Apple-Notes-MCP

A Model Context Protocol (MCP) server that provides read/write access to Apple Notes via AppleScript.

## Project Overview

This is a TypeScript MCP server that exposes Apple Notes functionality as MCP tools. It uses `osascript` to execute AppleScript commands that interact with the Apple Notes application on macOS.

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js (>=18)
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Transport**: stdio (standard MCP transport)
- **Apple Notes Access**: AppleScript via `child_process.execFile("osascript", ...)`

## Project Structure

```
.
├── CLAUDE.md          # This file - project context for Claude
├── README.md          # User-facing documentation
├── package.json       # Node.js dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── src/
│   └── index.ts       # Main MCP server entry point
└── dist/              # Compiled JavaScript output (gitignored)
```

## MCP Tools

The server exposes these tools:

1. **list_notes** - List notes, optionally filtered by folder. Returns note names and folders.
2. **get_note_content** - Get the content of a specific note by name (and optional folder).
3. **add_note** - Create a new note with a name, content, and optional folder.
4. **update_note_content** - Update the content of an existing note.

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with ts-node
- `npm start` - Run compiled server

## Build & Run

```bash
npm install
npm run build
node dist/index.js
```

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apple-notes": {
      "command": "node",
      "args": ["/path/to/Apple-Notes-MCP/dist/index.js"]
    }
  }
}
```

## Key Design Decisions

- AppleScript is executed via `osascript -e` using `child_process.execFile` for safety (no shell interpolation).
- Note content is retrieved as plain text (not HTML/rich text) for simplicity.
- Folder defaults to "Notes" when not specified.
- Error handling wraps all AppleScript calls and returns descriptive MCP errors.

## Testing

- macOS only (requires Apple Notes app)
- Test manually by running the server and connecting via Claude Desktop or MCP Inspector
