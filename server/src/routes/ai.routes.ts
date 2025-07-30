import express, { Router, Request, Response } from "express";
import errorHandler from "../utils/errorHandler.utils";
import models from "../constants/constants";
import groqAPI from "../apis/groq.apis";
import githubAPI from "../apis/github.apis";
import openRouterAPI from "../apis/openRouter.apis";

const aiRouter = Router();

aiRouter.use(express.json());
aiRouter.use(express.urlencoded({ extended: true }));

aiRouter.post('/', async (req: Request, res: Response) => {
    const { prompt, model, needReasoning, temperature, top_p } = req.body;

    if (!prompt) return res.status(422).send({ error: "No prompt was given" });
    if (!model) return res.status(422).send({ error: "No model name was given" });

    let fnAPI: Function | null = null;
    let modelChosen: string = "";
    if (models.groq[model]) {
        fnAPI = groqAPI;
        modelChosen = models.groq[model];
    }
    else if (models.github[model]) {
        fnAPI = githubAPI;
        modelChosen = models.github[model];
    }
    else if (models.openRouter[model]) {
        fnAPI = openRouterAPI;
        modelChosen = models.openRouter[model];
    }


    if (!fnAPI) {
        return res.status(404).send({ error: `Invalid AI model "${model}" was chosen` });
    }

    try {
        const result = await fnAPI(prompt, modelChosen, needReasoning, temperature, top_p);
        if (!result || !result.success) {
            return res.status(500).send({ error: result?.error || "Internal Server Error" });
        }
        return res.status(200).send({ result });
    } catch (err) {
        errorHandler('./src/routes/ai.routes.ts', err);
        return res.status(500).send({ error: "Unhandled error occurred during AI API call" });
    }
});

export default aiRouter;