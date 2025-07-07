import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async (): Promise<void> => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables.');
    }

    try {
        await mongoose.connect(MONGO_URI);
    } catch (err) {
        if (err instanceof Error) {
            throw new Error('./config/config.ts -> Failed to connect to database: ' + err);
        } else {
            throw new Error('./config/config.ts -> Failed to connect to database due to unknown error');
        }
    }
};

export default connectDb;