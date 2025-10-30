
export function splitIntoParagraphs(text: string): string[] {
    if (!text) return [];
    // Split by one or more newlines, then filter out any empty strings
    return text.split(/\n+/).filter(p => p.trim().length > 0);
}
