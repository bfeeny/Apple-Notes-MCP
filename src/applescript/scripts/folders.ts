import { escapeForAppleScript, AS_FIELD_SEP, AS_RECORD_SEP } from "../runner.js";

const F = AS_FIELD_SEP;
const R = AS_RECORD_SEP;

export function listFoldersScript(account?: string): string {
  const folderRef = account
    ? `folders of account "${escapeForAppleScript(account)}"`
    : "folders";

  return `
    tell application "Notes"
      set folderItems to ${folderRef}
      set output to ""
      repeat with i from 1 to count of folderItems
        set f to item i of folderItems
        set output to output & (id of f) & ${F} & (name of f) & ${F} & (count of notes of f)
        if i < (count of folderItems) then set output to output & ${R}
      end repeat
      return output
    end tell
  `;
}

export function createFolderScript(name: string, account?: string): string {
  const escaped = escapeForAppleScript(name);
  const location = account
    ? `account "${escapeForAppleScript(account)}"`
    : `default account`;

  return `
    tell application "Notes"
      set newFolder to make new folder at ${location} with properties {name:"${escaped}"}
      return (id of newFolder) & ${F} & (name of newFolder)
    end tell
  `;
}
