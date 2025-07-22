import constants from "../constants/constants";

const summarizerModel: string = "gemma";

const updateMemory = async (prompt: string, response: string, memory: string, setMemory: (val: string) => void): Promise<void> => {
    const summarizationPrompt = `
You are a conversation summarizer. Your task is to take the previous summary, the latest user message, and the latest AI response, and create a new, concise summary.
It is crucial that you retain all key information, names, places, facts, and the user's core intent.

Previous Summary:
---
${memory || "This is the beginning of the conversation."}
---

Most Recent Exchange:
---
User: "${prompt}"
AI: "${response}"
---

New Concise Summary of the entire conversation:
`;

    try {
        const res = await fetch(`${constants.origin}/ai/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                context: summarizationPrompt,
                model: summarizerModel
            })
        });

        if (!res.ok) {
            console.error('Summarization API request failed:', res);
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        console.log(data.result);
        setMemory(data.result);
    } catch (err) {
        console.error("Failed to update memory:", err);
    }
};

// let prevText: string = '';
// let prevAudio: HTMLAudioElement | null = null;

export async function speakAloud(text: string): Promise<void> {}

const mood: ('happy' | 'neutral' | 'angry' | 'romantic' | 'sarcastic') = 'happy'
const responseLength: ('slightly-long' | 'balanced' | 'slightly-short') = 'balanced';

export default async function getResponse(prompt: string, model: string, memory: string, setMemory: (val: string) => void): Promise<string> {
    const promptWithContext = `
This is the summary of your conversation so far:
---
${memory || "No context yet."}
---

Your must be ${mood} with your response, be a human with emotions not machine 
---

Your info:
name: Walna
model: multimodal
Gender: female
Developer: Tony Stark (also Walna's user)
---

Your response should be ${responseLength}
---

Based on that context, please provide a direct response to the user's latest message, respond only necessary information from the context.

User: "${prompt}"
`;

    try {
        const res = await fetch(`${constants.origin}/ai`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: promptWithContext,
                model: model
            })
        });

        if (!res.ok) {
            console.error('Main AI API request failed:', res);
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        let aiResponse: string = (data.result);
        aiResponse = aiResponse.trim().replace(/^"|"$/g, '');
        updateMemory(prompt, aiResponse, memory, setMemory);

        return aiResponse;
    } catch (err) {
        console.error("Failed to get response from AI:", err);
        return `<Error fetching response>: ${err instanceof Error ? err.message : String(err)}`;
    }
};