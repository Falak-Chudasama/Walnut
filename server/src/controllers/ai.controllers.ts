import { Request, Response } from "express";
import { embed, search } from "../rag/rag";
import groqAPI from "../apis/groq.apis";
import githubAPI from "../apis/github.apis";
import openRouterAPI from "../apis/openRouter.apis";
import models from "../constants/constants";
import errorHandler from "../utils/errorHandler.utils";

const defaultPromptSysMessage: string = "Your Identity if Walnut, a female AI assistant, be friendly to the user";
const defaultSummarizerSysMessage: string = "Your job is to summarize the given response (possibly reasoning too) of an AI bot, do not miss any important or specific information, keep it concise, clean.";

const defaultSummarizerModel: string = "llama-3.3-70b-versatile";
const summarizerReasoning: boolean = false;
const summarizerTemp: number = 1;
const summarizerTopP: number = 1;
const defaultK = 5;

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

const summarizeResponse = async (response: string, reasoning: string = "") => {
    const [API] = getAPIFn(defaultSummarizerModel);

    const messages: object[] = [
        {
            role: "system",
            content: defaultSummarizerSysMessage
        },
        {
            role: "user",
            content: `THIS IS RESPONSE :: ${response}`
        },
        {
            role: "user",
            content: `THIS IS REASONING :: ${reasoning}`
        }
    ];

    try {
        const result = await API(messages, defaultSummarizerModel, summarizerReasoning, summarizerTemp, summarizerTopP);
        if (!result || !result.success) {
            throw new Error(result?.error || "Internal Server Error");
        } else if (!result.response) {
            throw new Error(result?.error || "Could not get response from the API");
        }
        return result;
    } catch (err) {
        errorHandler('./src/controllers/ai.controllers.ts', err);
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
        const context = await search(prompt, defaultK);
        await embed(prompt);

        const messages: object[] = [
            {
                role: "system",
                content: defaultPromptSysMessage
            },
            {
                role: "system",
                content: parseContext(context.results)
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

        const summarizedResult = await summarizeResponse(result.response, result.reasoning);
        if (!summarizedResult?.response) {
            return res.status(500).send({ error: "Summarization failed." });
        }

        await embed(summarizedResult.response, false);

        return res.status(200).send({ result, context });
    } catch (err) {
        errorHandler('./src/controllers/ai.controllers.ts', err);
        return res.status(500).send({ error: "Unhandled error occurred during AI API call" });
    }
};

export {
    message,
    summarizeResponse,
};

export default message