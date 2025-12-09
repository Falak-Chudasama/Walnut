import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import aiRouter from "../routes/ai.routes";
// import path from "path";
// import { fileURLToPath } from 'url';

dotenv.config({ quiet: true });
const app = express();

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app.use(express.static(path.resolve(__dirname, "../public")));

const ACCEPTED_ORIGINS = process.env.ACCEPTED_ORIGINS?.split(',') || [];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));


app.get('/', (req: Request, res: Response) => {
    res.send('Walnut Server is running');
});

app.use('/ai', aiRouter);

export default app;