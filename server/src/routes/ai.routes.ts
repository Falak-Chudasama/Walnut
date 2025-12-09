import express, { Router, Request, Response } from "express";
import message, { forgetContext, getChats, getChatById } from "../controllers/ai.controllers";

const aiRouter = Router();

aiRouter.use(express.json());
aiRouter.use(express.urlencoded({ extended: true }));

aiRouter.post('/', async (req: Request, res: Response) => {
    await message(req, res);
});

aiRouter.delete('/forget-context/', async (req: Request, res: Response) => {
    await forgetContext(req, res);
});

aiRouter.get('/chats', async (req: Request, res: Response) => {
    await getChats(req, res);
});

aiRouter.get('/chats/:id', async (req: Request, res: Response) => {
    await getChatById(req, res);
});

export default aiRouter;