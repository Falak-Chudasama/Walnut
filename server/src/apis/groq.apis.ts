import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";
import { Groq } from "groq-sdk";

dotenv.config({ quiet: true });

const API_KEY = process.env.GROQ_API_KEY || null;
if (!API_KEY) throw new Error('Main API key for groq was not specified');

const groq = new Groq({ apiKey: API_KEY });

async function groqAPI(prompt: string, model: string = 'llama3', context: string, needReasoning: boolean = false, maxCompletionTokens: number = 2048): Promise<object> {
    try {
        const chatCompletion = await groq.chat.completions.create(
            needReasoning ? 
            {
            "messages": [
                {
                    "role": "system",
                    "content": "Your name is 'Walnut', this is your identity"
                },
                {
                    "role": "system",
                    "content": context
                },
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
            "stop": null,
            "reasoning_effort": "default",
            "reasoning_format": "parsed"
        }
        : {
            "messages": [
                {
                    "role": "system",
                    "content": "Your name is 'Walnut', this is your identity"
                },
                {
                    "role": "system",
                    "content": context
                },
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
            "stop": null,
        }
    );
        let response: string[] = []

        const [streamForResponding, streamForReasoning] = chatCompletion.tee();

        for await (const chunk of streamForResponding) {
            response.push(chunk.choices[0]?.delta?.content || '');
        }
        
        if (needReasoning) {
            let reasoning: string[] = [];
            for await (const chunk of streamForReasoning) {
                reasoning.push(chunk.choices[0]?.delta?.reasoning || '');
            }

            console.log(reasoning);

            return { response: response.join(''), reasoning: reasoning.join(''), success: true }
        }

        return { response: response.join('')};
    } catch (err) {
        console.log(err);
        errorHandler('./src/apis/groq.apis.ts', err);
        return { error: err, success: false };
    }
}

export default groqAPI;