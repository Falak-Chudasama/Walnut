import dotenv from "dotenv";
import app from "./app/app";
import connectDb from "./config/config";
import errorHandler from "./utils/errorHandler.utils";

dotenv.config({ quiet: true });

const PORT: number = Number(process.env.PORT) || 5000;

(async (): Promise<void> => {
    try {
        await connectDb();
        console.log('Successfuly connected to the database');
        app.listen(PORT, async () => {
            console.log(`Server is running at -> http://localhost:${PORT}`);
        });
    } catch (err) {
        errorHandler('./index.ts', err);
    }
})();