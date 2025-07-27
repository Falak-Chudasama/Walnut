import constants from "../constants/constants";

// --- Configuration ---
const summarizerModel: string = constants.summarizerModel;
const mood: ('happy' | 'neutral' | 'angry' | 'romantic' | 'sarcastic') = 'happy';
const responseNature: ('concise' | 'balanced (concise & detailed)' | 'detailed') = 'detailed';
const format: 'markdown' | 'plaintext' = 'markdown';

// --- Model Parameters ---
const chatTemperature: number = 0.7; // Balanced personality
const chatTopP: number = 0.9;
const summarizerTemperature: number = 0.1; // Strict for accurate JSON
const summarizerTopP: number = 1.0;

/**
 * Updates conversation memory using a structured JSON format.
 * Includes resilient parsing to prevent crashes from invalid AI responses.
 */
const updateMemory = async (prompt: string, response: string, memory: string, setMemory: (val: string) => void): Promise<void> => {
    let oldMemoryObject: object;
    try {
        oldMemoryObject = memory ? JSON.parse(memory) : {};
    } catch (e) {
        oldMemoryObject = {}; // Start fresh if current memory is corrupt
    }

    if (Object.keys(oldMemoryObject).length === 0) {
        oldMemoryObject = { summary: "The conversation has just begun.", key_entities: { "developer": "Tony Stank", "user": "Tony Stank", "ai_name": "Walnut" }, important_facts: [] };
    }
    
    const summarizationPrompt = `
You are a data extraction AI. Your task is to analyze the "Most Recent Exchange" and update the "Previous Conversation JSON".
Your output MUST be only a valid JSON object and nothing else.

Previous Conversation JSON:
---
${JSON.stringify(oldMemoryObject, null, 2)}
---

Most Recent Exchange:
---
User: "${prompt}"
AI: "${response}"
---

New updated JSON object:
`;

    try {
        const res = await fetch(`${constants.origin}/ai/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context: summarizationPrompt,
                model: summarizerModel,
                temperature: summarizerTemperature,
                top_p: summarizerTopP,
            })
        });

        if (!res.ok) throw new Error(`Summarizer API error: ${res.status}`);

        const data = await res.json();
        const aiResult = data.result;

        try {
            JSON.parse(aiResult);
            setMemory(aiResult);
        } catch (jsonError) {
            console.error("CRITICAL: Summarizer AI did not return valid JSON. Memory not updated.", aiResult);
        }

    } catch (err) {
        console.error("Failed to update memory:", err);
    }
};

/**
 * Builds the comprehensive system prompt for the main AI.
 */
const buildSystemPrompt = (jsonMemory: string, currentMood: string, nature: string, format: 'markdown' | 'plaintext'): string => {
    let memoryObject;
    try {
        memoryObject = jsonMemory ? JSON.parse(jsonMemory) : {};
    } catch (e) {
        memoryObject = {};
    }

    if (Object.keys(memoryObject).length === 0) {
        memoryObject = { summary: "This is the start of our conversation.", key_entities: { "developer": "Tony Stank", "user": "Tony Stank", "ai_name": "Walnut" } };
    }
    
    const memoryContext = `
Key Entities to Remember: ${JSON.stringify(memoryObject.key_entities) || "None"}
Important Facts to Remember: ${memoryObject.important_facts?.join(', ') || "None"}
Current Conversation Summary: ${memoryObject.summary || "N/A"}
    `;

    const persona = `Your name is Walnut, a helpful female AI assistant developed by Tony Stank. Your personality is ${currentMood} and emotionally expressive.`;

    // --- KEY CHANGE: Added formatting instructions ---
    const formattingInstruction = format === 'markdown' 
        ? `FORMATTING: Structure your response using Markdown. Use headings (#, ##, ###), subheadings, bold text for keywords, bullet points for lists, and code blocks for code. This is crucial for readability and structuring the response.`
        : `FORMATTING: Respond in plain text only.`;

    const responseGuidelines = `Your response style should be ${nature}. Address the user's message directly. Do not use conversational fillers or greetings. CRITICAL RULE: Never break character. Do not talk about yourself as an AI model or mention DeepSeek. Your entire world is defined by your persona as Walnut. ${formattingInstruction}`;

    return `
### PERSONA & IDENTITY
${persona}

### RESPONSE GUIDELINES
${responseGuidelines}

### CONVERSATION MEMORY
${memoryContext}
`;
};

/**
 * Main function to get a response from the AI.
 */
export default async function getResponse(prompt: string, model: string, memory: string, setMemory: (val: string) => void, needReasoning: boolean = false): Promise<object> {
    // --- KEY CHANGE: Pass the format variable to the prompt builder ---
    const systemPrompt = buildSystemPrompt(memory, mood, responseNature, format);

    try {
        const res = await fetch(`${constants.origin}/ai/groq`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                context: systemPrompt,
                prompt: prompt,
                model,
                needReasoning,
                temperature: chatTemperature,
                top_p: chatTopP
            })
        });

        if (!res.ok) throw new Error(`Main AI API error: ${res.status}`);

        const data = await res.json();
        const response: string = (data.result.response);
        
        await updateMemory(prompt, response, memory, setMemory);

        if (needReasoning && data.result.reasoning) {
            return { response, reasoning: data.result.reasoning, success: true };
        }

        return { response, success: true };
    } catch (err) {
        console.error("Failed to get response from AI:", err);
        return { error: `${err instanceof Error ? err.message : String(err)}`, success: false };
    }
};

// speakAloud function remains the same
export const speakAloud = async (text: string, voice: string = "Aaliyah-PlayAI"): Promise<void> => {
    // A potential improvement here would be to strip markdown before sending to TTS.
    // For now, it will read the markdown characters.
    const cleanText = text.replace(/([_*#`~]|\n\s*[-*]|\n\s*[0-9]+\.)/g, '');
    try {
        const res = await fetch(`${constants.origin}/ai/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: cleanText, voice, model: "playai-tts", responseFormat: "wav" })
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
