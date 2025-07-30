export default function parseModelResponse(raw: string): { reasoning: string | null, response: string } {
    const thinkTagRegex = /<think>([\s\S]*?)<\/think>/i;
    const match = raw.match(thinkTagRegex);

    if (!match) {
        return { reasoning: null, response: raw.trim() };
    }

    const reasoning = match[1].trim();
    const response = raw.replace(thinkTagRegex, '').trim();

    return { reasoning, response };
}