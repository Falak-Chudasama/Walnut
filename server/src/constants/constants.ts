const models: Record<string,Record<string,string>> = {
    groq: {
        "llama-3": "llama-3.3-70b-versatile",
        "llama-4-maverick": "meta-llama/llama-4-maverick-17b-128e-instruct",
        "deepseek-r1": 'deepseek-r1-distill-llama-70b',
        "groq": "groq/compound",
        "kimi": "moonshotai/kimi-k2-instruct-0905",
        "gpt-oss": "openai/gpt-oss-120b",
        "qwen-3-small": "qwen/qwen3-32b"
    },
}

export { models }
export default models;