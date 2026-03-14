# Apple-Notes-MCP

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that provides read and write access to Apple Notes on macOS.

## Features

- **List notes** — Browse all notes or filter by folder
- **Read notes** — Get the content of any note by name
- **Create notes** — Add new notes to any folder
- **Update notes** — Modify the content of existing notes

## Requirements

- macOS (uses AppleScript to communicate with Apple Notes)
- Node.js >= 18
- Apple Notes app

## Installation

```bash
git clone https://github.com/bfeeny/Apple-Notes-MCP.git
cd Apple-Notes-MCP
npm install
npm run build
```

## Usage with Claude Desktop

Add the following to your Claude Desktop configuration file at `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apple-notes": {
      "command": "node",
      "args": ["/absolute/path/to/Apple-Notes-MCP/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop and you'll be able to interact with your Apple Notes.

## Available Tools

| Tool | Description |
|------|-------------|
| `list_notes` | List notes with optional folder filter and limit |
| `get_note_content` | Retrieve the content of a specific note |
| `add_note` | Create a new note in a specified folder |
| `update_note_content` | Update an existing note's content |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in dev mode
npm run dev
```

## How It Works

This server uses AppleScript (via `osascript`) to communicate with the Apple Notes application. Each MCP tool maps to an AppleScript command that reads from or writes to your notes.

## License

MIT
