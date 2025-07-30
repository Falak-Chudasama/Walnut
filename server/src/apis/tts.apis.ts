// import path from "path";
// import dotenv from "dotenv";
// import fs from "fs";
// import { fileURLToPath } from 'url';
// import errorHandler from "../utils/errorHandler.utils";
// import { Groq } from "groq-sdk";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// dotenv.config({ quiet: true });

// const API_KEY = process.env.GROQ_API_KEY;
// if (!API_KEY) throw new Error("GROQ_API_KEY was not specified");

// const groq = new Groq({ apiKey: API_KEY });

// async function groqTTS(
//     text: string,
//     voice: string = "Aaliyah-PlayAI",
//     model: string = "playai-tts",
//     responseFormat: string = "mp3" 
// ): Promise<{ audioBuffer: Buffer; success: boolean } | { error: any; success: false }> {
//     try {
//         const wav = await groq.audio.speech.create({
//             model,
//             voice,
//             response_format: responseFormat as any,
//             input: text,
//         });

//         const buffer = Buffer.from(await wav.arrayBuffer());
        
//         console.log(`TTS audio buffer created successfully.`);
//         return {
//             audioBuffer: buffer,
//             success: true,
//         };
//     } catch (err) {
//         console.log(err);
//         errorHandler("src/apis/tts.apis.ts", err);
//         return { error: err, success: false };
//     }
// }

// export default groqTTS;