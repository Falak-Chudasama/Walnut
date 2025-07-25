import { useContext } from "react";
import { PromptCountContext, ModelContext } from "../context/context";

function SwitchModel() {
    const { promptCount, setPromptCount } = useContext(PromptCountContext)!;
    const { model, setModel } = useContext(ModelContext)!;

    const models: object = {
        "llama3": "./llama3.png"
    }

    return (
        <div className="group absolute top-[30%] duarion-500 left-0 w-max h-max z-50">
            <div
                onClick={() => setPromptCount(0)}
                className={`
                    cursor-pointer
                    transition-all duration-500 ease-in-out
                    ${promptCount === 0 ? "-translate-x-full" : "-translate-x-24"}
                    group-hover:translate-x-0
                    flex items-center text-xl font-pacifico
                    bg-walnut-dark rounded-tr-full rounded-br-full
                    w-fit p-2 text-walnut-pale
                `}
            >
                New Chat
                <button className="rounded-full bg-walnut-pale h-7 w-7 ml-4 flex items-center justify-center hover:scale-110 duration-200">
                    <img className="h-5 w-auto" src={ `./plus.png` } alt="model logo" />
                </button>
            </div>
        </div>
    );
}

export default SwitchModel;