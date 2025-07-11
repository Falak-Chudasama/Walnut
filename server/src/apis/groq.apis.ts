import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";
import { Groq } from "groq-sdk";

dotenv.config({ quiet: true });

const API_KEY = process.env.GROQ_API_KEY || null;
if (!API_KEY) throw new Error('API key for groq was not specified');

const groq = new Groq({ apiKey: API_KEY });

async function groqAPI(prompt: string, model: string = 'llama', maxCompletionTokens: number = 1024): Promise<string> {
    try {
        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": model,
            "temperature": 1,
            "max_completion_tokens": maxCompletionTokens,
            "top_p": 1,
            "stream": true,
            "stop": null
        });

        let response: string[] = [];

        for await (const chunk of chatCompletion) {
            response.push(chunk.choices[0]?.delta?.content || '');
        }

        return response.join('');
    } catch (err) {
        errorHandler('./src/apis/groq.apis.ts', err);
        return "<error_occurence>";
    }
}

export default groqAPI;