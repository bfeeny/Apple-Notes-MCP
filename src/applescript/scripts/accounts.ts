import { AS_FIELD_SEP, AS_RECORD_SEP } from "../runner.js";

const F = AS_FIELD_SEP;
const R = AS_RECORD_SEP;

export function listAccountsScript(): string {
  return `
    tell application "Notes"
      set acctItems to accounts
      set output to ""
      repeat with i from 1 to count of acctItems
        set a to item i of acctItems
        set output to output & (id of a) & ${F} & (name of a)
        if i < (count of acctItems) then set output to output & ${R}
      end repeat
      return output
    end tell
  `;
}
