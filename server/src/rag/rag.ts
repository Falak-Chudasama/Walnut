import dotenv from "dotenv";
import errorHandler from "../utils/errorHandler.utils";

dotenv.config({ quiet: true });
const MICRO_SERVICES_ORIGIN = process.env.MICRO_SERVICES_ORIGIN

const embed = async (content: string) => {
    try {
        const result = await fetch(`${MICRO_SERVICES_ORIGIN}/embed`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content,
                metadata: {
                    app: "Walnut"
                }
            })
        });

        if (!result.ok) {
            throw new Error('Internal server error');
        }

        const response = await result.json();

        return {
            content,
            message: response.message,
            ids: response.ids,
            success: true
        }
    } catch (err) {
        errorHandler('./src/rag/rag.ts', err);
        return { error: err, success: false }
    }
};

const search = async (query: string, k: number = 3) => {
    try {
        const result = await fetch(`${MICRO_SERVICES_ORIGIN}/search`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query,
                k
            })
        });

        if (!result.ok) {
            throw new Error('Internal server error');
        }

        const response = await result.json();

        return {
            query,
            results: response.results,
            success: true
        }
    } catch (err) {
        errorHandler('./src/rag/rag.ts', err);
        return { error: err, success: false }
    }
};

const clear = async () => {
    try {
            const result = await fetch(`${MICRO_SERVICES_ORIGIN}/delete-all`,{
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!result.ok) {
            throw new Error('Internal server error');
        }

        return {
            success: true
        }
    } catch (err) {
        errorHandler('./src/rag/rag.ts', err);
        return { error: err, success: false }
    }
}

export { 
    embed,
    search,
    clear
};

export default embed;