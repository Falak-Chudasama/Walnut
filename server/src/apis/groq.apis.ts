import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";
import { Groq } from "groq-sdk";
import parseModelResponse from "../utils/handleReasoning.utils";

dotenv.config({ quiet: true });

const API_KEY = process.env.GROQ_API_KEY || null;
if (!API_KEY) throw new Error("Main API key for groq was not specified");

const groq = new Groq({ apiKey: API_KEY });

async function groqAPI(
    prompt: string,
    model: string = "llama-3.3-70b-versatile",
    needReasoning: boolean = false,
    temperature: number = 1,
    top_p: number = 1
): Promise<object> {
    try {
        const messages = [
            {
                role: "user",
                content: prompt,
            },
        ];

        // Use non-streaming approach - more reliable
        const completion = await groq.chat.completions.create({
            messages,
            model,
            temperature,
            top_p,
            max_tokens: +process.env.MAX_ACCEPTED_TOKENS!,
            // No stream property or stream: false
        });

        const content = completion.choices[0]?.message?.content || "";
        const { reasoning, response } = parseModelResponse(content);

        if (needReasoning) {
            return { response, reasoning, model, success: true };
        }
        return { response: response || content, model, success: true };
        
    } catch (err) {
        errorHandler("./src/apis/groq.apis.ts", err);
        return { 
            error: err, 
            model, 
            success: false 
        };
    }
}

export default groqAPI;