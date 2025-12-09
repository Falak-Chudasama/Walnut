import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Request, Response } from "express";
import { embed, search, clear } from "../rag/rag";
import groqAPI from "../apis/groq.apis";
import githubAPI from "../apis/github.apis";
import openRouterAPI from "../apis/openRouter.apis";
import models from "../constants/constants";
import errorHandler from "../utils/errorHandler.utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "../data");
const chatsPath = path.join(dataDir, "chats.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(chatsPath)) fs.writeFileSync(chatsPath, JSON.stringify({ chats: [] }, null, 2), "utf8");

const defaultPromptSysMessage = `
You are Walnut, a precise, reliable and humanlike AI assistant.
Be accurate, helpful and clear. Avoid hallucination.
Use retrieved context only when relevant.
Greet only when no prior context exists.
`;

const baseK = 3;
const maxK = 12;

let prevResponse = "";

const getAPIFn = (model: string): [Function, string] => {
    let API: Function | null = () => { };
    let APIModel = "NULL_MODEL";
    if (models.groq[model]) {
        API = groqAPI;
        APIModel = models.groq[model];
    } else if (models.github[model]) {
        API = githubAPI;
        APIModel = models.github[model];
    } else if (models.openRouter[model]) {
        API = openRouterAPI;
        APIModel = models.openRouter[model];
    }
    return [API, APIModel];
};

const parseContext = (contexts: any[]): string => {
    if (!contexts?.length) return "";
    return contexts
        .map((c) => `${c.text} — ${c.metadata.source === "User" ? "User" : "Assistant"}`)
        .join("\n\n");
};

const readChats = () => {
    const raw = fs.readFileSync(chatsPath, "utf8");
    return JSON.parse(raw || "{}") || { chats: [] };
};

const writeChats = (data: any) => {
    fs.writeFileSync(chatsPath, JSON.stringify(data, null, 2), "utf8");
};

export const message = async (req: Request, res: Response) => {
    const { prompt, model, chatTitle, chatCreationDateTime, chatCount, needReasoning, temperature, top_p } = req.body;

    if (!prompt) return res.status(422).send({ error: "No prompt was given" });
    if (!model) return res.status(422).send({ error: "No model name was given" });

    const [API, APIModel] = getAPIFn(model);
    if (!API) return res.status(404).send({ error: `Invalid AI model "${model}"` });

    try {
        const dynamicK = Math.min(maxK, Math.ceil(prompt.length / 100) + baseK);
        const context = await search(prompt, dynamicK);

        const messages = [
            { role: "system", content: defaultPromptSysMessage },
            { role: "system", content: `Previous response: ${prevResponse || ""}` },
            { role: "system", content: `Retrieved context:\n${parseContext(context.results)}` },
            { role: "system", content: `Timestamp: ${new Date().toISOString()}` },
            { role: "user", content: prompt }
        ];

        const result = await API(messages, APIModel, needReasoning, temperature, top_p);
        if (!result?.success || !result.response) return res.status(500).send({ error: "AI Error" });

        const rawChunk = `USER: ${prompt}\nASSISTANT: ${result.response}`;
        await embed(rawChunk);

        prevResponse = result.response;

        const data = readChats();

        let finalChatTitle = chatTitle;
        let finalChatCreationDateTime = chatCreationDateTime;

        if (chatCount === 0) {
            finalChatTitle = prompt.trim().substring(0, 60);
            finalChatCreationDateTime = new Date().toISOString();

            data.chats.push({
                chatTitle: finalChatTitle,
                chatCreationDateTime: finalChatCreationDateTime,
                chatCount,
                messages: [
                    { role: "user", content: prompt },
                    { role: "assistant", content: result.response }
                ]
            });

            writeChats(data);

            return res.status(200).send({
                result,
                context,
                chatTitle: finalChatTitle,
                chatCreationDateTime: finalChatCreationDateTime
            });
        }

        let existing = data.chats.find(
            (c: any) =>
                c.chatTitle === chatTitle &&
                c.chatCreationDateTime === chatCreationDateTime
        );

        if (!existing) {
            finalChatTitle = prompt.trim().substring(0, 60);
            finalChatCreationDateTime = new Date().toISOString();
            data.chats.push({
                chatTitle: finalChatTitle,
                chatCreationDateTime: finalChatCreationDateTime,
                chatCount,
                messages: [
                    { role: "user", content: prompt },
                    { role: "assistant", content: result.response }
                ]
            });
            writeChats(data);
            return res.status(200).send({
                result,
                context,
                chatTitle: finalChatTitle,
                chatCreationDateTime: finalChatCreationDateTime
            });
        }

        existing.messages.push({ role: "user", content: prompt });
        existing.messages.push({ role: "assistant", content: result.response });

        writeChats(data);

        return res.status(200).send({ result, context });
    } catch (err) {
        errorHandler("./src/controllers/ai.controllers.ts", err);
        return res.status(500).send({ error: "Unhandled backend error" });
    }
};

export const getChats = async (req: Request, res: Response) => {
    try {
        const data = readChats();
        return res.status(200).send({ success: true, result: data.chats ?? [] });
    } catch (err) {
        errorHandler("./src/controllers/ai.controllers.ts", err);
        return res.status(500).send({ success: false, error: "Failed to read chats" });
    }
};

export const getChatById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const data = readChats();
        const chat = data.chats.find((c: any) => c.chatCreationDateTime === id || c.chatTitle === id);
        if (!chat) return res.status(404).send({ success: false, error: "Chat not found" });
        return res.status(200).send({ success: true, result: chat });
    } catch (err) {
        errorHandler("./src/controllers/ai.controllers.ts", err);
        return res.status(500).send({ success: false, error: "Failed to read chat" });
    }
};

export const forgetContext = async (req: Request, res: Response) => {
    try {
        prevResponse = "";
        const out = await clear();
        if (!out?.success) return res.status(500).send({ error: out?.error || "Failed to clear context" });
        return res.status(200).send({ message: "Context cleared", success: true });
    } catch (err) {
        errorHandler("./src/controllers/ai.controllers.ts", err);
        return res.status(500).send({ error: "Unhandled backend error" });
    }
};

export default message;