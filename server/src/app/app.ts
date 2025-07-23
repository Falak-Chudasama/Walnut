import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import groqAPI from "../apis/groq.apis";
import groqAPISummarizer from "../apis/summarizer.apis";

dotenv.config({ quiet: true });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.ACCEPTED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

const models: { [key: string]: string } = {
    // deepseek: 'deepseek-r1-distill-llama-70b',
    llama3: "llama-3.3-70b-versatile",
    llama_maverick: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    llama_scout: 'meta-llama/llama-4-scout-17b-16e-instruct',
    llama_guard: 'meta-llama/llama-guard-4-12b',
    mistral: "mistral-saba-24b",
    qwen3: 'qwen/qwen3-32b',
    gemma: 'gemma2-9b-it',
    // whisper: 'distil-whisper-large-v3-en', this is a voice model
    compoud: 'compound-beta',
};

app.get('/', (req: Request, res: Response) => { 
    res.send('Api is running');
});

app.post('/ai', async (req: Request, res: Response) => {
    try {
        const prompt: string = req.body.prompt;
        const requestedModel: string = models[req.body.model];
    
        if (!prompt) {
            return res.status(400).send('Prompt is required');
        }
    
        if (!requestedModel) {
            return res.status(400).send('Invalid AI model was chosen');
        }

        const result: string = await groqAPI(prompt, requestedModel);

        res.send({ result });
    } catch (err) {
        res.status(500).send('Internal Server Error: ' + err);
    }
});

app.post('/ai/summarize', async (req: Request, res: Response) => {
    try {
        const context: string = req.body.context;
        const requestedModel: string = models[req.body.model];
    
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