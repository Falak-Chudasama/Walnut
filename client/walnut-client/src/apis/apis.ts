import constants from "../constants/constants";
import { ChatMetaContext } from "../context/ChatMetaContext";

const temperature = constants.temperature;
const top_p = constants.top_p;

export async function forgetContext(): Promise<object> {
    try {
        const response = await fetch(`${constants.origin}/ai/forget-context/`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Main AI API error: ${response.status}`);

        const data = await response.json();

        console.log(data);

        return data;
    } catch (err) {
        console.error("Failed to clear the context:", err);
        return {
            error: `Failed to fetch AI response: ${err.message || String(err)}`,
            success: false
        };
    }
}

export default async function getResponse(prompt, model, chatTitle, chatCreationDateTime, chatCount, needReasoning = false): Promise<object> {
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
                chatTitle,
                chatCreationDateTime,
                chatCount
            }),
        });

        if (!res.ok) throw new Error(`Main AI API error: ${res.status}`);

        const data = await res.json();

        if (!data?.result?.success) {
            throw new Error(`AI API returned failure: ${data?.result?.error || "Unknown error"}`);
        }

        if (chatCount === 0) {
            return {
                response: data.result.response,
                chatTitle: data.chatTitle,
                chatCreationDateTime: data.chatCreationDateTime,
                success: true
            };
        }

        if (!needReasoning) {
            return {
                response: data.result.response,
                success: true
            };
        }

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