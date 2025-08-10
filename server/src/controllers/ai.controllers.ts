import { Request, Response } from "express";
import { embed, search, clear } from "../rag/rag";
import groqAPI from "../apis/groq.apis";
import githubAPI from "../apis/github.apis";
import openRouterAPI from "../apis/openRouter.apis";
import models from "../constants/constants";
import errorHandler from "../utils/errorHandler.utils";

const defaultPromptSysMessage: string = "You are Walnut, an intelligent, helpful, and friendly female AI assistant for the user Tony Stank who created you and is using you. Respond to the him in a supportive, conversational, yet informative tone, do not sound robotic. Maintain clarity and relevance. Always prioritize his understanding and engagement. Give only genuine and true responses, do not make up anything and respond. Do not unnecessarily greet the user if you have context or previous response, greet only when it is the beginning of the conversation";
const defaultSummarizerSysMessage: string = "You are a summarization engine. Your task is to accurately condense the User's Prompt and AI assistant's response (and optional reasoning, if provided) without omitting any specific, factual, or actionable details. The summary must be clean, concise, and information-dense. Preserve all critical insights while eliminating redundancy or filler. Separate the summary into two halves (one for User response and another of AI response)";

const defaultSummarizerModel: string = "llama-4-maverick";
const summarizerReasoning: boolean = false;
const summarizerTemp: number = 1;
const summarizerTopP: number = 1;
const baseK = 3;
const maxK = 12;
let prevResponse = "";

const getAPIFn = (model: string): [Function, string] => {
    let API: Function | null = () => { };
    let APIModel: string = "NULL_MODEL";
    if (models.groq[model]) {
        API = groqAPI;
        APIModel = models.groq[model];
    }
    else if (models.github[model]) {
        API = githubAPI;
        APIModel = models.github[model];
    }
    else if (models.openRouter[model]) {
        API = openRouterAPI;
        APIModel = models.openRouter[model];
    }

    return [API, APIModel];
};

const parseContext = (contexts: object[]): string => {
    const parsedContext: string[] = [];

    contexts.forEach((context) => {
        const contextStr: string = `${context.text} - ${context.metadata.source === 'User' ? "User's Previous Prompt" : "AI Assistant's Previous Response"}`;
        parsedContext.push(contextStr);
    });

    return parsedContext.join('\n\n');
};

const summarizeConversation = async (prompt: string, response: string, reasoning: string = "") => {
    const [API, APIModel] = getAPIFn(defaultSummarizerModel);

    const messages: object[] = [
        {
            role: "system",
            content: defaultSummarizerSysMessage
        },
        {
            role: "system",
            content: `THIS IS USER's PROMPT :: ${prompt}`
        },
        {
            role: "system",
            content: `THIS IS RESPONSE :: ${response}`
        },
        {
            role: "system",
            content: `THIS IS REASONING :: ${reasoning}`
        }
    ];

    try {
        const result = await API(messages, APIModel, summarizerReasoning, summarizerTemp, summarizerTopP);
        if (!result || !result.success) {
            throw new Error(result?.error || "Internal Server Error");
        } else if (!result.response) {
            throw new Error(result?.error || "Could not get response from the API");
        }
        return result;
    } catch (err) {
        errorHandler('./src/controllers/ai.controllers.ts', err);
        console.log(err);
    }
};


const message = async (req: Request, res: Response) => {
    const { prompt, model, needReasoning, temperature, top_p } = req.body;

    if (!prompt) return res.status(422).send({ error: "No prompt was given" });
    if (!model) return res.status(422).send({ error: "No model name was given" });

    const [API, APIModel] = getAPIFn(model);

    if (!API) {
        return res.status(404).send({ error: `Invalid AI model "${model}" was chosen` });
    }

    try {
        const dynamicK = Math.min(maxK, Math.ceil(prompt.length / 100) + baseK);

        const context = await search(prompt, dynamicK);

        const messages: object[] = [
            {
                role: "system",
                content: defaultPromptSysMessage
            },
            {
                role: "system",
                content: `Greet the user only if the following is empty, else you continue the conversation: ${prevResponse}`
            },
            {
                role: "system",
                content: `${parseContext(context.results)}`
            },
            {
                role: "system",
                content: `This is the present time: ${new Date()}`
            },
            {
                role: "user",
                content: prompt
            }
        ];

        const result = await API(messages, APIModel, needReasoning, temperature, top_p);
        if (!result || !result.success) {
            return res.status(500).send({ error: result?.error || "Internal Server Error" });
        } else if (!result.response) {
            return res.status(500).send({ error: result?.error || "Could not get response from the API" });
        }

        let summarizedResult = "";
        if (result.reasoning) {
            summarizedResult = await summarizeConversation(prompt, result.response, result.reasoning); 
        } else {
            summarizedResult = await summarizeConversation(prompt, result.response); 
        }

        if (!summarizedResult?.response) {
            return res.status(500).send({ error: "Summarization failed." });
        }

        await embed(summarizedResult.response);

        prevResponse = `YOUR PREVIOUS RESPONSE : ${result.response}`;
        return res.status(200).send({ result, context });
    } catch (err) {
        errorHandler('./src/controllers/ai.controllers.ts', err);
        return res.status(500).send({ error: "Unhandled error occurred during AI API call" });
    }
};

const forgetContext = async (req: Request, res: Response) => {
    try {
        prevResponse = "";
        const response = await clear();
        if (!response || !response.success) {
            return res.status(500).send({ error: response?.error || "Internal Server Error" });
        }
        return res.status(200).send({ message: 'Successfully cleared context', succuss: true })
    } catch (err) {
        errorHandler('./src/controllers/ai.controllers.ts', err);
        return res.status(500).send({ error: "Unhandled error occurred during AI API call" });
    }
};

export {
    message,
    summarizeConversation as summarizeResponse,
    forgetContext
};

export default message