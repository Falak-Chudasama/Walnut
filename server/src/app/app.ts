import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import express, { Request, Response } from "express";
import groqAPI from "../apis/groq.apis";
import groqAPISummarizer from "../apis/summarizer.apis";
import groqTTS from "../apis/tts.apis";
import azureAPI from "../apis/azure.apis";

dotenv.config({ quiet: true });

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, "../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.ACCEPTED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

const groqModels: { [key: string]: string } = {
    deepseek: 'deepseek-r1-distill-llama-70b',
    llama3: "llama-3.3-70b-versatile",
    llama_maverick: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    llama_scout: 'meta-llama/llama-4-scout-17b-16e-instruct',
    llama_guard: 'meta-llama/llama-guard-4-12b',
    mistral: "mistral-saba-24b",
    qwen3: 'qwen/qwen3-32b',
    gemma: 'gemma2-9b-it',
    compoud: 'compound-beta',
};

const githubModels: { [key: string]: string } = {
    "gpt4.1": "openai/gpt-4.1",
    "gpt4.1-mini": "openai/gpt-4.1-mini",
    "deepseek-r1": "deepseek/DeepSeek-R1",
}

app.get('/', (req: Request, res: Response) => { 
    res.send('Api is running');
});

app.post('/ai/groq', async (req: Request, res: Response) => {
    try {
        const prompt: string = req.body.prompt;
        const requestedModel: string = groqModels[req.body.model];
        const context: string = req.body.context;
        const needReasoning: boolean = req.body.needReasoning;
    
        if (!prompt) {
            return res.status(400).send('Prompt is required');
        }
        
        if (!context) {
            return res.status(400).send('Context is required');
        }
    
        if (!requestedModel) {
            return res.status(400).send('Invalid AI model was chosen');
        }

        const result: object = await groqAPI(prompt, requestedModel, context, needReasoning);

        res.send({ result });
    } catch (err) {
        res.status(500).send('Internal Server Error: ' + err);
    }
});

app.post('/ai/tts', async (req: Request, res: Response) => {
    try {
        const text: string = req.body.text;
        const voice: string = req.body.voice || "Aaliyah-PlayAI";
        const model: string = req.body.model || "playai-tts";
        const responseFormat: string = req.body.responseFormat || "wav";

        if (!text) {
            console.log('Text is required, whigger')
            return res.status(400).send('Text is required');
        }

        const result: object = await groqTTS(text, voice, model, responseFormat);

        res.send({ result });
    } catch (err) {
        res.status(500).send('Internal Server Error: ' + err);
    }
});

app.post('/ai/github-models', async (req: Request, res: Response) => {
    try {
        const prompt: string = req.body.prompt;
        const context: string = req.body.context;
        // const requestedModel: string = githubModels[req.body.model];
    
        if (!prompt) {
            return res.status(400).send('Prompt is required');
        }
        if (!context) {
            return res.status(400).send('Context is required');
        }
    
        // if (!requestedModel) {
        //     return res.status(400).send('Invalid AI model was chosen');
        // }

        const result: object = await azureAPI(prompt, context);

        res.send({ result });
    } catch (err) {
        res.status(500).send('Internal Server Error: ' + err);
    }
});

app.post('/ai/summarize', async (req: Request, res: Response) => {
    try {
        const context: string = req.body.context;
        const requestedModel: string = groqModels[req.body.model];
    
        if (!context) {
            return res.status(400).send('Context is required');
        }

        if (!requestedModel) {
            return res.status(400).send('Invalid AI model was chosen');
        }

        const result: string = await groqAPISummarizer(context, requestedModel);

        res.send({ result });
    } catch (err) {
        res.status(500).send('Internal Server Error: ' + err);
    }
});

export default app;