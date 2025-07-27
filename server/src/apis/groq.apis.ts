import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";
import { Groq } from "groq-sdk";

dotenv.config({ quiet: true });

const API_KEY = process.env.GROQ_API_KEY || null;
if (!API_KEY) throw new Error('Main API key for groq was not specified');

const groq = new Groq({ apiKey: API_KEY });

// --- KEY FIXES ---
// 1. Added temperature and top_p to the function signature to accept frontend parameters.
// 2. Set default values for them in case they aren't provided.
async function groqAPI(
    prompt: string, 
    model: string, 
    context: string, 
    needReasoning: boolean = false, 
    temperature: number = 0.7, // Default to a balanced temperature
    top_p: number = 0.9,
    maxCompletionTokens: number = 6000
): Promise<object> {
    try {
        // --- KEY FIX ---
        // 3. The messages array is simplified. We only need ONE system message, 
        //    which is the comprehensive 'context' built by the frontend.
        const messages = [
            {
                "role": "system",
                "content": context // The entire system prompt comes from the frontend now.
            },
            {
                "role": "user",
                "content": prompt
            }
        ];

        // --- KEY FIX ---
        // 4. Refactored the payload creation to avoid duplicating code.
        const payload: Groq.Chat.CompletionCreateParams = {
            messages,
            model,
            temperature, // Use the passed-in temperature
            top_p,       // Use the passed-in top_p
            max_tokens: maxCompletionTokens,
            stream: true, // Stream is kept as you are handling it below
            stop: null,
        };

        // Conditionally add reasoning format if needed.
        if (needReasoning) {
            payload.reasoning_format = "hidden";
        }

        const chatCompletion = await groq.chat.completions.create(payload);
        
        // Your stream handling logic is fine, so it remains.
        let response: string[] = [];
        if (needReasoning) {
            const [streamForResponding, streamForReasoning] = chatCompletion.tee();
            let reasoning: string[] = [];
            
            const responding = (async () => {
                for await (const chunk of streamForResponding) {
                    response.push(chunk.choices[0]?.delta?.content || '');
                }
            })();

            const reasoningProcessing = (async () => {
                for await (const chunk of streamForReasoning) {
                    reasoning.push(chunk.choices[0]?.delta?.reasoning || '');
                }
            })();

            await Promise.all([responding, reasoningProcessing]);
            return { response: response.join(''), reasoning: reasoning.join(''), success: true };

        } else {
            for await (const chunk of chatCompletion) {
                response.push(chunk.choices[0]?.delta?.content || '');
            }
            return { response: response.join(''), success: true };
        }

    } catch (err) {
        console.log(err);
        errorHandler('./src/apis/groq.apis.ts', err);
        return { error: err, success: false };
    }
}

export default groqAPI;
