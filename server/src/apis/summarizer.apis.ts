import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";
import { Groq } from "groq-sdk";

dotenv.config({ quiet: true });

const API_KEY = process.env.GROQ_SUMMARIZER_API_KEY;
if (!API_KEY) throw new Error('Summarizer API key for groq was not specified');

const groq = new Groq({ apiKey: API_KEY });

async function groqAPISummarizer(context: string, model: string = 'llama', maxCompletionTokens: number = 1024): Promise<string> {
    try {

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "system",
                    "content": context
                }
            ],
            "model": model,
            "max_completion_tokens": maxCompletionTokens,
            "stream": true,
            temperature: 0.3,
            top_p: 0.95,
            stop: ["\n\n", "[END]"]

        });

        let response: string[] = [];

        for await (const chunk of chatCompletion) {
            response.push(chunk.choices[0]?.delta?.content || '');
        }

        return response.join('');
    } catch (err) {
        errorHandler('./src/apis/summarizer.apis.ts', err);
        return "<error_occurence>";
    }
}

export default groqAPISummarizer;