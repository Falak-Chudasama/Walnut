import OpenAI from 'openai';
import dotenv from "dotenv";
import errorHandler from '../utils/errorHandler.utils';
import parseModelResponse from '../utils/handleReasoning.utils';

dotenv.config({ quiet: true });

const token = process.env.OPENROUTER_API_KEY || null;
if (!token) throw new Error('Main API key for openrouter was not specified');

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: token
});


async function openRouterAPI(messages: object[], model: string = 'qwen/qwen3-coder:free', needReasoning: boolean = false, temperature: number = 1, top_p: number = 1): Promise<object> {
    try {
        const completion = await openai.chat.completions.create({
            messages,
            model,
            temperature,
            top_p,
            max_tokens: +process.env.MAX_ACCEPTED_TOKENS!,
            reasoning_effort: needReasoning ? "high" : "low",
        });

        const { reasoning, response } = parseModelResponse(completion.choices[0].message.content!);
        if (!needReasoning) {
            return { response, model, success: true };
        } else if (needReasoning && completion.choices[0].message.reasoning) {
            return { response, reasoning: completion.choices[0].message.reasoning, model, success: true };
        } else {
            return { response, reasoning, model, success: true };
        }
    } catch (err) {
        errorHandler('./src/apis/openRouter.apis.ts', err);
        return { error: err, model, success: false } // this is good only for dev not production
    }
}

export default openRouterAPI;