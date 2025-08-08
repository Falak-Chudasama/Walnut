const constants = {
    appVersion: "1.0.0",
    origin: "http://127.0.0.1:3050",
    defaultModel: "llama-3",
    temperature: 0.5,
    top_p: 1,
    groqModels: [
        "llama-3",
        "llama-4-maverick",
        "deepseek-r1",
        "playai",
        "kimi"
    ],
    githubModels: [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4.1",
        "llama-4-scout",
        "deepseek-v3",
        "grok-3",
        "mistral-med",
        "phi-4"
    ],
    openRouterModels: [
        "qwen-3",
        "gemini-2.0"
    ],
    loadedModels: [
        ["gpt-5", "./gpt.png"],
        ["gpt-4o", "./gpt.png"],
        ["llama-3", "./llama.png"],
        ["deepseek-r1", "./deepseek.png"],
        ["qwen-3", "./qwen.png"],
        ["grok-3", "./grok.png"]
    ]
};
export default constants;