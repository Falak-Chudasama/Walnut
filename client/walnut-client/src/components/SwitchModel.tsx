import { useContext } from "react";
import { PromptCountContext, ModelContext } from "../context/context";

function SwitchModel() {
    const { promptCount, setPromptCount } = useContext(PromptCountContext)!;
    const { model, setModel } = useContext(ModelContext)!;

    const models: object = {
        "llama3": "./llama.png",
        "gpt4o": "./gpt.png",
        "deepseek": "./deepseek.png",
        "qwen3": "./qwen.png",
        "phi": "./phi.png",
        "gemma": "./gemma.png",
        "mistral": "./mistral.png",
    }

    return (
        <div className="group absolute top-[30%] duarion-500 left-0 w-max h-max z-50">
            <div
                onClick={() => setPromptCount(0)}
                className={`
                    cursor-pointer
                    transition-all duration-500 ease-in-out
                    ${promptCount === 0 ? "-translate-x-full" : "-translate-x-18"}
                    group-hover:translate-x-0
                    flex items-center justify-between text-xl font-pacifico
                    bg-walnut-dark rounded-tr-full rounded-br-full
                    w-30 p-2 text-walnut-pale
                `}
            >
                {model}
                <div className="rounded-full bg-walnut-pale h-7 w-7 ml-4 flex items-center justify-center hover:scale-110 duration-200">
                    <img className="h-4.5 w-auto" src={ `${models[model]}` } alt="model logo" />
                </div>
            </div>
        </div>
    );
}

export default SwitchModel;