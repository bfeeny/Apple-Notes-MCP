# Apple Notes MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that lets Claude interact with Apple Notes on macOS. Since Apple Notes has no REST API, this server uses AppleScript (via `osascript`) to automate Notes.app.

## Features

- **Notes:** List, read, create, update, and delete notes
- **Folders:** List and create folders
- **Search:** Full-text search across all notes
- **Accounts:** List available accounts (iCloud, On My Mac, etc.)
- **Move:** Move notes between folders

## Prerequisites

- macOS (Apple Notes is macOS-only)
- Node.js 18+
- Apple Notes.app

## Installation

```bash
git clone https://github.com/bfeeny/Apple-Notes-MCP.git
cd Apple-Notes-MCP
npm install
npm run build
```

## macOS Permissions

The first time you run the server, macOS will prompt you to grant Automation access. You can also configure this manually:

1. Open **System Settings → Privacy & Security → Automation**
2. Find your terminal app (Terminal, iTerm2, VS Code, etc.)
3. Enable the toggle for **Notes**

If you see `Not authorized to send Apple events` errors, this permission hasn't been granted.

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "apple-notes": {
      "command": "node",
      "args": ["<path-to-repo>/dist/index.js"]
    }
  }
}
```

## Usage with Claude Code

```bash
claude mcp add apple-notes node <path-to-repo>/dist/index.js
```

## Available Tools

| Tool | Description |
|------|-------------|
| `list_notes` | List notes, optionally filtered by folder/account |
| `get_note` | Get the full content of a note by ID |
| `create_note` | Create a new note in a specified folder |
| `update_note` | Update the title or body of an existing note |
| `delete_note` | Permanently delete a note |
| `list_folders` | List all folders, optionally filtered by account |
| `create_folder` | Create a new folder |
| `move_note` | Move a note to a different folder |
| `search_notes` | Search notes by text content |
| `list_accounts` | List all available Notes accounts |

## Development

```bash
npm run dev    # Run with ts-node
npm run build  # Compile TypeScript
npm start      # Run compiled output
```

## Known Limitations

- **Tags** are not exposed in the macOS AppleScript dictionary
- **Pinned notes** cannot be pinned/unpinned programmatically
- **Rich text, tables, and drawings** are not accessible — only text content
- **Large note libraries** may be slow due to AppleScript iteration
- **Password-protected notes** cannot be read or modified

## License

MIT
