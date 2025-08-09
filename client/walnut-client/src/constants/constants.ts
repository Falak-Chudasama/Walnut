const constants = {
    appVersion: "1.0.0",
    origin: "http://127.0.0.1:3050",
    defaultModel: "gpt-oss",
    temperature: 0.5,
    top_p: 1,
    groqModels: [
        "llama-3",
        "llama-4-maverick",
        "deepseek-r1",
        "kimi",
        "gpt-oss",
        "qwen-3-small",
        "playai"
    ],
    githubModels: [
        "gpt-5",
        "gpt-5-mini",
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
        "gemini-2.0",
        "gpt-oss-small",
        "llama-nemotron"
    ],
    loadedModels: [
        ["gpt-4o", "./gpt.png"],
        ["gpt-oss", "./gpt.png"],
        ["llama-nemotron", "./llama.png"],
        ["grok-3", "./grok.png"],
        ["deepseek-r1", "./deepseek.png"],
    ]
};
export default constants;