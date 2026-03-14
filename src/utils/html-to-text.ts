/**
 * Simple HTML→plain text conversion for Apple Notes HTML body content.
 * Apple Notes uses a limited HTML subset, so this doesn't need to be exhaustive.
 */
export function htmlToText(html: string): string {
  return html
    // Line breaks
    .replace(/<br\s*\/?>/gi, "\n")
    // Block elements get newlines
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    // Strip remaining tags
    .replace(/<[^>]+>/g, "")
    // Decode common entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse excessive blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
