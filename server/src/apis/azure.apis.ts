import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";

dotenv.config({ quiet: true });

const token = process.env.AZURE_API_KEY;
const endpoint = "https://models.github.ai/inference";

const client = ModelClient(endpoint, new AzureKeyCredential(token!));

async function azureAPI(prompt: string, model: string = "openai/gpt-4.1", context: string = "You are a helpful assistant."): Promise<object> {
    try {
    
        const result = await client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "Your name is 'Walnut', this is your identity" },
                    { role: "system", content: context },
                    { role: "user", content: prompt }
                ],
                temperature: 1.0,
                top_p: 1.0,
                model,
            }
        });
    
        console.log(result);

        if (isUnexpected(result)) {
            throw result.body.error;
        }

        const response = result.body.choices[0].message.content;
        return { response, success: true };
    } catch (err) {
        errorHandler('./src/apis/azure.apis.ts', err);
        return { success: false };
    }
}

export default azureAPI;