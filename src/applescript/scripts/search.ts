import { escapeForAppleScript, AS_FIELD_SEP, AS_RECORD_SEP } from "../runner.js";

const F = AS_FIELD_SEP;
const R = AS_RECORD_SEP;

export function searchNotesScript(query: string, limit: number = 20): string {
  const escaped = escapeForAppleScript(query);

  return `
    tell application "Notes"
      set matchingNotes to notes whose name contains "${escaped}" or plaintext contains "${escaped}"
      set maxCount to ${limit}
      if (count of matchingNotes) < maxCount then set maxCount to (count of matchingNotes)
      set output to ""
      repeat with i from 1 to maxCount
        set n to item i of matchingNotes
        set output to output & (id of n) & ${F} & (name of n) & ${F} & (name of container of n) & ${F} & (modification date of n as string)
        if i < maxCount then set output to output & ${R}
      end repeat
      return output
    end tell
  `;
}
