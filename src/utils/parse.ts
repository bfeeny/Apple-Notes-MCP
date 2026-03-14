import { FIELD_SEP, RECORD_SEP } from "../applescript/runner.js";

/**
 * Parse AppleScript output using ASCII FS/RS control character delimiters.
 * Returns an array of string arrays (each inner array is one record's fields).
 */
export function parseRecords(output: string): string[][] {
  if (!output) return [];
  return output
    .split(RECORD_SEP)
    .map((record) => record.split(FIELD_SEP))
    .filter((fields) => fields.length > 0 && fields[0] !== "");
}

/**
 * Parse a single record (no record delimiter expected).
 */
export function parseFields(output: string): string[] {
  if (!output) return [];
  return output.split(FIELD_SEP);
}

export interface NoteSummary {
  id: string;
  name: string;
  folder: string;
  modifiedDate: string;
}

export function toNoteSummaries(output: string): NoteSummary[] {
  return parseRecords(output).map(([id, name, folder, modifiedDate]) => ({
    id: id ?? "",
    name: name ?? "",
    folder: folder ?? "",
    modifiedDate: modifiedDate ?? "",
  }));
}

export interface NoteDetail {
  id: string;
  name: string;
  folder: string;
  plaintext: string;
  createdDate: string;
  modifiedDate: string;
  passwordProtected: boolean;
}

export function toNoteDetail(output: string): NoteDetail {
  // getNoteScript field order: id | name | folder | created | modified | pwProtected | plaintext...
  // plaintext is last (and spread) so any FS chars in content don't corrupt fixed fields.
  const [id, name, folder, createdDate, modifiedDate, pwProtected, ...textParts] =
    parseFields(output);
  return {
    id: id ?? "",
    name: name ?? "",
    folder: folder ?? "",
    createdDate: createdDate ?? "",
    modifiedDate: modifiedDate ?? "",
    passwordProtected: pwProtected === "true",
    plaintext: textParts.join(FIELD_SEP),
  };
}

export interface FolderSummary {
  id: string;
  name: string;
  noteCount: number;
}

export function toFolderSummaries(output: string): FolderSummary[] {
  return parseRecords(output).map(([id, name, count]) => ({
    id: id ?? "",
    name: name ?? "",
    noteCount: parseInt(count ?? "0", 10),
  }));
}

export interface AccountSummary {
  id: string;
  name: string;
}

export function toAccountSummaries(output: string): AccountSummary[] {
  return parseRecords(output).map(([id, name]) => ({
    id: id ?? "",
    name: name ?? "",
  }));
}
