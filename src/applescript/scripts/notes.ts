import { escapeForAppleScript, AS_FIELD_SEP, AS_RECORD_SEP } from "../runner.js";

// AppleScript expressions for ASCII FS (28) and RS (29) control characters.
// These are safe to use as delimiters since they cannot appear in Notes content.
const F = AS_FIELD_SEP;
const R = AS_RECORD_SEP;

export function listNotesScript(folder?: string, limit: number = 20): string {
  const folderRef = folder
    ? `notes of folder "${escapeForAppleScript(folder)}"`
    : "notes";

  return `
    tell application "Notes"
      set noteItems to ${folderRef}
      set maxCount to ${limit}
      if (count of noteItems) < maxCount then set maxCount to (count of noteItems)
      set output to ""
      repeat with i from 1 to maxCount
        set n to item i of noteItems
        set output to output & (id of n) & ${F} & (name of n) & ${F} & (name of container of n) & ${F} & (modification date of n as string)
        if i < maxCount then set output to output & ${R}
      end repeat
      return output
    end tell
  `;
}

export function getNoteScript(noteName: string, folder?: string): string {
  const escaped = escapeForAppleScript(noteName);
  const noteRef = folder
    ? `first note of folder "${escapeForAppleScript(folder)}" whose name is "${escaped}"`
    : `first note whose name is "${escaped}"`;

  // plaintext is last so any accidental FS chars in content don't corrupt fixed fields.
  return `
    tell application "Notes"
      set n to ${noteRef}
      return (id of n) & ${F} & (name of n) & ${F} & (name of container of n) & ${F} & (creation date of n as string) & ${F} & (modification date of n as string) & ${F} & (password protected of n as string) & ${F} & (plaintext of n)
    end tell
  `;
}

export function createNoteScript(
  name: string,
  content: string,
  folder: string = "Notes"
): string {
  const escapedName = escapeForAppleScript(name);
  const escapedContent = escapeForAppleScript(content);
  const escapedFolder = escapeForAppleScript(folder);

  return `
    tell application "Notes"
      set targetFolder to folder "${escapedFolder}"
      set newNote to make new note at targetFolder with properties {name:"${escapedName}", body:"${escapedContent}"}
      return (id of newNote) & ${F} & (name of newNote)
    end tell
  `;
}

export function updateNoteScript(
  noteName: string,
  newContent: string,
  folder?: string
): string {
  const escaped = escapeForAppleScript(noteName);
  const escapedContent = escapeForAppleScript(newContent);
  const noteRef = folder
    ? `first note of folder "${escapeForAppleScript(folder)}" whose name is "${escaped}"`
    : `first note whose name is "${escaped}"`;

  return `
    tell application "Notes"
      set n to ${noteRef}
      set body of n to "${escapedContent}"
      return (id of n) & ${F} & (name of n)
    end tell
  `;
}

export function deleteNoteScript(noteName: string, folder?: string): string {
  const escaped = escapeForAppleScript(noteName);
  const noteRef = folder
    ? `first note of folder "${escapeForAppleScript(folder)}" whose name is "${escaped}"`
    : `first note whose name is "${escaped}"`;

  return `
    tell application "Notes"
      set n to ${noteRef}
      set noteName to name of n
      delete n
      return "Deleted: " & noteName
    end tell
  `;
}

export function appendToNoteScript(
  noteName: string,
  appendContent: string,
  folder?: string
): string {
  const escaped = escapeForAppleScript(noteName);
  const escapedContent = escapeForAppleScript(appendContent);
  const noteRef = folder
    ? `first note of folder "${escapeForAppleScript(folder)}" whose name is "${escaped}"`
    : `first note whose name is "${escaped}"`;

  return `
    tell application "Notes"
      set n to ${noteRef}
      set body of n to (body of n) & "<br>" & "${escapedContent}"
      return (id of n) & ${F} & (name of n)
    end tell
  `;
}

export function duplicateNoteScript(
  noteName: string,
  targetFolder?: string,
  sourceFolder?: string
): string {
  const escaped = escapeForAppleScript(noteName);
  const noteRef = sourceFolder
    ? `first note of folder "${escapeForAppleScript(sourceFolder)}" whose name is "${escaped}"`
    : `first note whose name is "${escaped}"`;

  // Use container of n as default destination so it stays in the same folder.
  // "default folder" is not valid in Notes AppleScript.
  const dest = targetFolder
    ? `folder "${escapeForAppleScript(targetFolder)}"`
    : `container of n`;

  return `
    tell application "Notes"
      set n to ${noteRef}
      set noteBody to body of n
      set copyName to (name of n) & " (copy)"
      set newNote to make new note at ${dest} with properties {name:copyName, body:noteBody}
      return (id of newNote) & ${F} & (name of newNote)
    end tell
  `;
}

export function moveNoteScript(
  noteName: string,
  targetFolder: string,
  sourceFolder?: string
): string {
  const escaped = escapeForAppleScript(noteName);
  const escapedTarget = escapeForAppleScript(targetFolder);
  const noteRef = sourceFolder
    ? `first note of folder "${escapeForAppleScript(sourceFolder)}" whose name is "${escaped}"`
    : `first note whose name is "${escaped}"`;

  return `
    tell application "Notes"
      set n to ${noteRef}
      move n to folder "${escapedTarget}"
      return (id of n) & ${F} & (name of n)
    end tell
  `;
}

export function exportNoteScript(noteName: string, folder?: string): string {
  const escaped = escapeForAppleScript(noteName);
  const noteRef = folder
    ? `first note of folder "${escapeForAppleScript(folder)}" whose name is "${escaped}"`
    : `first note whose name is "${escaped}"`;

  return `
    tell application "Notes"
      set n to ${noteRef}
      return (id of n) & ${F} & (name of n) & ${F} & (creation date of n as string) & ${F} & (modification date of n as string) & ${F} & (body of n)
    end tell
  `;
}
