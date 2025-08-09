import express, { Router, Request, Response } from "express";
import message, { forgetContext } from "../controllers/ai.controllers";

const aiRouter = Router();

aiRouter.use(express.json());
aiRouter.use(express.urlencoded({ extended: true }));

aiRouter.post('/', async (req: Request, res: Response) => {
    await message(req, res);
});

aiRouter.delete('/forget-context/', async (req: Request, res: Response) => {
    await forgetContext(req, res);
});

export default aiRouter;