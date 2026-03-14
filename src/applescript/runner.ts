import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * ASCII control characters used as delimiters in AppleScript output.
 * These cannot appear in Apple Notes text content, making them safe separators.
 *   FS (0x1C) = field separator within a record
 *   RS (0x1D) = record separator between records
 */
export const FIELD_SEP = "\x1C";
export const RECORD_SEP = "\x1D";

/**
 * AppleScript expressions for the delimiter characters.
 * Use these inside AppleScript templates: `& AS_FS & `
 */
export const AS_FIELD_SEP = `(ASCII character 28)`;
export const AS_RECORD_SEP = `(ASCII character 29)`;

export interface AppleScriptResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Execute an AppleScript string via osascript and return structured result.
 * Never throws — caller gets { success, output, error }.
 */
export async function runAppleScript(
  script: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<AppleScriptResult> {
  try {
    const { stdout } = await execFileAsync("osascript", ["-e", script], {
      timeout: timeoutMs,
    });
    return { success: true, output: stdout.trim() };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown AppleScript error";

    // Classify common errors
    if (message.includes("not allowed assistive access")) {
      return {
        success: false,
        output: "",
        error:
          "Automation permission denied. Grant your terminal access in System Settings > Privacy & Security > Automation.",
      };
    }
    if (message.includes("Can't get note") || message.includes("Can't get folder")) {
      return {
        success: false,
        output: "",
        error: `Not found: ${message}`,
      };
    }

    return { success: false, output: "", error: `AppleScript error: ${message}` };
  }
}

/**
 * Escape a string for safe embedding inside AppleScript double-quoted strings.
 */
export function escapeForAppleScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
