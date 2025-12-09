const constants = {
    appVersion: "1.0.0",
    origin: "http://127.0.0.1:3050",
    defaultModel: "gpt-oss",
    temperature: 0.5,
    top_p: 1,
    groqModels: [
        "gpt-oss",
        "llama-3",
        "llama-4-maverick",
        "deepseek-r1",
        "kimi",
        "qwen-3-small",
        "playai"
    ],
    loadedModels: [
        ["gpt-oss", "./gpt.png"],
        ["llama-3", "./llama.png"],
    ]
};
export default constants;