import express, { Router, Request, Response } from "express";
import message from "../controllers/ai.controllers";

const aiRouter = Router();

aiRouter.use(express.json());
aiRouter.use(express.urlencoded({ extended: true }));

aiRouter.post('/', async (req: Request, res: Response) => {
    await message(req, res);
});

export default aiRouter;