import constants from "../constants/constants";

const temperature = constants.temperature;
const top_p = constants.top_p;

export default async function getResponse(
    prompt: string,
    model: string,
    needReasoning: boolean = false
): Promise<{ response?: string; reasoning?: string; error?: string; success: boolean }> {
    try {
        const res = await fetch(`${constants.origin}/ai/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                model,
                needReasoning,
                temperature,
                top_p,
            }),
        });

        if (!res.ok) throw new Error(`Main AI API error: ${res.status}`);

        const data = await res.json();

        if (!data?.result?.success) {
            throw new Error(`AI API returned failure: ${data?.result?.error || "Unknown error"}`);
        }

        if (!needReasoning) {
            return {
                response: data.result.response,
                success: true
            };
        };

        return {
            response: data.result.response,
            reasoning: data.result.reasoning,
            success: true
        };

    } catch (err: any) {
        console.error("Failed to get response from AI:", err);
        return {
            error: `Failed to fetch AI response: ${err.message || String(err)}`,
            success: false
        };
    }
}