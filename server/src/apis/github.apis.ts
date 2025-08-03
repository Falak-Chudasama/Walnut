import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";
import parseModelResponse from "../utils/handleReasoning.utils";

dotenv.config({ quiet: true });

const token = process.env.GITHUB_API_KEY || null;
if (!token) throw new Error('Main API key for github was not specified');


const endpoint = "https://models.github.ai/inference";

const client = ModelClient(endpoint, new AzureKeyCredential(token!));

async function githubAPI(messages: object[], model: string = 'openai/gpt-4o', needReasoning: boolean = false, temperature: number = 1, top_p: number = 1): Promise<object> {
    try {
        const result = await client.path("/chat/completions").post({
            body: {
                messages,
                temperature,
                top_p,
                model,
                max_tokens: +process.env.MAX_ACCEPTED_TOKENS!,
                reasoning_effort: "low"
            }
        });

        if (isUnexpected(result)) {
            throw result.body.error;
        }

        const { reasoning, response } = parseModelResponse(result.body.choices[0].message.content);
        if (needReasoning) {
            return { response, reasoning, model, success: true };
        }
        return { response, model, success: true };
    } catch (err) {
        errorHandler('./src/apis/azure.apis.ts', err);
        return { error: err, model, success: false }; // this is good only for dev not production
    }
}

export default githubAPI;