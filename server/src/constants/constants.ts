const models: Record<string,Record<string,string>> = {
    groq: {
        "llama-3": "llama-3.3-70b-versatile",
        "llama-4-maverick": "meta-llama/llama-4-maverick-17b-128e-instruct",
        "deepseek-r1": 'deepseek-r1-distill-llama-70b',
        "playai": "playai-tts",
        "kimi": "moonshotai/kimi-k2-instruct",
    },
    github: {
        "gpt-4o": "openai/gpt-4o",
        "gpt-4.1":"openai/gpt-4.1",
        "llama-4-scout": "meta/Llama-4-Scout-17B-16E-Instruct",
        "deepseek-v3": "deepseek/DeepSeek-V3-0324",
        "grok-3":"xai/grok-3"
    },
    openRouter: {
        "qwen-3": "qwen/qwen3-235b-a22b:free",
        "gemini-2.0": "google/gemini-2.0-flash-exp:free"
    }
}

export { models }
export default models;