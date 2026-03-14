# Apple Notes MCP Server

## Project Overview
An MCP (Model Context Protocol) server that bridges Claude to Apple Notes via AppleScript, executed through Node.js `child_process.exec` calling `osascript`. There is no Apple Notes REST API — AppleScript is the only reliable automation path on macOS.

## Architecture
```
MCP Client (Claude)
       │
       ▼
MCP Server (Node.js / TypeScript)
  ├── Tool Handlers (src/tools/)
  ├── AppleScript Runner (src/applescript/runner.ts) ──► osascript ──► Apple Notes.app
  └── Response Formatter (src/utils/)
```

## Tech Stack
- **Runtime:** Node.js + TypeScript
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **AppleScript execution:** `child_process.exec('osascript -e ...')`
- **No external dependencies** beyond the MCP SDK

## Project Structure
```
src/
├── index.ts              # Entry point — starts the MCP server
├── server.ts             # Tool registration and MCP server setup
├── tools/
│   ├── notes.ts          # Note CRUD: list, get, create, update, delete
│   ├── folders.ts        # Folder tools: list, create
│   ├── accounts.ts       # Account listing
│   └── search.ts         # Search notes
├── applescript/
│   ├── runner.ts         # osascript execution layer (exec wrapper)
│   └── scripts/
│       ├── notes.ts      # AppleScript templates for note operations
│       ├── folders.ts    # AppleScript templates for folder operations
│       └── search.ts     # AppleScript templates for search
└── utils/
    ├── html-to-text.ts   # Strip Notes HTML to plain text
    └── parse.ts          # Parse AppleScript output → typed objects
```

## Data Model
Apple Notes hierarchy:
```
Account ("iCloud", "On My Mac")
  └── Folder
        └── Note
              ├── id (unique, stable)
              ├── name (title)
              ├── body (HTML)
              ├── creation date
              ├── modification date
              └── password protected (bool)
```

## Implementation Phases
1. **Phase 1 (Core):** `list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`
2. **Phase 2 (Organization):** `list_folders`, `create_folder`, `move_note`, `search_notes`
3. **Phase 3 (Accounts & Metadata):** `list_accounts`, `export_note`
4. **Phase 4 (Polish):** `append_to_note`, `duplicate_note`, HTML→Markdown conversion

## Commands
- `npm install` — install dependencies
- `npm run build` — compile TypeScript to dist/
- `npm run dev` — run with ts-node for development
- `npm start` — run compiled JS from dist/

## Key Conventions
- All AppleScript templates live in `src/applescript/scripts/` as template string functions
- The runner (`src/applescript/runner.ts`) handles exec, error parsing, and timeout
- Tool handlers in `src/tools/` should be thin: validate input → call AppleScript → parse output → return
- AppleScript output uses `|||` as a field delimiter and `---` as a record delimiter
- Dates from AppleScript are parsed to ISO 8601 in the parse utilities
- Errors from osascript (permission denied, note not found) should be caught and returned as structured MCP errors, not thrown

## Known Limitations
- Tags are not exposed in the macOS AppleScript dictionary
- Pinning notes requires UI scripting (not implemented)
- Rich text, tables, and drawings are not representable — only text content is accessible
- Large note libraries can be slow due to `every note` iteration
- User must grant Automation permission to the terminal/Node app for Notes access
