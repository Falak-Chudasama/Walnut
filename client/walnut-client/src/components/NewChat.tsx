import { useContext } from "react";
import { PromptCountContext } from "../context/context";

function NewChat() {
    const { promptCount, setPromptCount } = useContext(PromptCountContext)!;

    return (
        <div className="group absolute top-[20%] duration-500 left-0 w-max h-max z-50">
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
                    <img className="h-5 w-auto" src="./plus.png" alt="plus sign" />
                </button>
            </div>
        </div>
    );
}

export default NewChat;