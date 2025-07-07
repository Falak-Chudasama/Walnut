import dotenv from "dotenv";
import app from "./app/app";
import connectDb from "./config/config";

dotenv.config();

const PORT: number = Number(process.env.PORT) || 5000;

(async (): Promise<void> => {
    try {
        await connectDb();
        app.listen(PORT, () => {
            console.log(`Server is running at -> http://localhost:${PORT}`);
        });
    } catch (err) {
        if (err instanceof Error) {
            console.error('./index.ts -> Error: ' + err);
        } else {
            console.error('./index.ts -> Unknown error');
        }
        
    }
})();