import cors from "cors";
import dotenv from "dotenv";
import express, { Response } from "express";
import aiRouter from "../routes/ai.routes";
// import path from "path";
// import { fileURLToPath } from 'url';

dotenv.config({ quiet: true });
const app = express();

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// app.use(express.static(path.resolve(__dirname, "../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: process.env.ACCEPTED_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));


app.get('/', (res: Response) => {
    res.send('Api is running');
});

app.use('/ai', aiRouter);

export default app;