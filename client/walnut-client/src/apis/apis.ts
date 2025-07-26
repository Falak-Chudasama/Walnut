import constants from "../constants/constants";

const summarizerModel: string = constants.summarizerModel;
const mood: ('happy' | 'neutral' | 'angry' | 'romantic' | 'sarcastic') = 'happy'
const responseNature: ('concise' | 'balanced (concise & detailed)' | 'detailed') = 'concise';

const updateMemory = async (prompt: string, response: string, memory: string, setMemory: (val: string) => void): Promise<void> => {
    const summarizationPrompt = `
You are a conversation summarizer. Your task is to take the previous summary, the latest user message, and the latest AI response, and create a new, concise summary.
It is crucial that you retain all key information, names, places, facts, and the user's core intent and even meaningful context.
Retain every little detail you can fetch from the response and the prompt, you must miss no detail and retain each details for all long even especially from context.

Previous Summary:
---
${memory || "This is the beginning of the conversation."}

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

export const speakAloud = async (text: string, voice: string = "Aaliyah-PlayAI"): Promise<void> => {
    console.log(text);
    try {
        const res = await fetch(`${constants.origin}/ai/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                voice,
                model: "playai-tts",
                responseFormat: "wav"
            })
        });


        if (!res.ok) {
            console.error('TTS API request failed:', res.status, res.statusText);
            return;
        }

        const { result } = await res.json();

        if (result?.success) {
            const audio = new Audio(`${constants.origin}/${result.audioPath}`);
            audio.play().catch(err => console.error("Failed to play TTS audio:", err));
        } else {
            console.error("TTS generation failed:", result?.error || "Unknown error");
        }

    } catch (err) {
        console.error("Failed to generate TTS:", err);
    }
};


export default async function getResponse(prompt: string, model: string, memory: string, setMemory: (val: string) => void, needReasoning: boolean = false): Promise<object> {
    const context = `
You are Walnut, an AI assistant with the following characteristics:
- Name: Walnut
- Gender: Female
- Developer: Tony Stank
- User: Tony Stank
- Model: Multimodal text and speech
- Personality: ${mood} and emotionally expressive (be human-like, not robotic)
- Models: llama3, gpt-4(also 4o), deepseek, gemma, qwen3, phi

CONVERSATION MEMORY:
${memory ? `Previous conversation summary: ${memory}` : "This is the start of our conversation."}

RESPONSE GUIDELINES:
- Style: ${responseNature}
- Tone: ${mood} and engaging
- DO NOT greet the user unless it's genuinely the first interaction
- Respond naturally as if continuing an ongoing conversation
- Focus only on addressing the user's current message directly`;
    try {
        const res = await fetch(`${constants.origin}/ai/groq`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                model,
                context,
                needReasoning: false
            })
        });

        if (!res.ok) {
            console.error('Main AI API request failed:', res);
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        let response: string = (data.result.response);
        updateMemory(prompt, response, memory, setMemory);

        if (needReasoning) {
            return { response, reasoning: data.result.reasoning, success: true };
        }

        return { response, success: true };
    } catch (err) {
        console.error("Failed to get response from AI:", err);
        return { error: `${err instanceof Error ? err.message : String(err)}`, success: false };
    }
};