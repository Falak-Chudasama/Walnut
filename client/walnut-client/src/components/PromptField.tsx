import { useContext, useState, useRef, useEffect } from "react";
import { PromptContext, PromptCountContext } from "../context/context";

function PromptField(getToBottom: boolean) {
    const { setPrompt } = useContext(PromptContext)!;
    const { promptCount, setPromptCount } = useContext(PromptCountContext)!;
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const submitInput = () => {
        if (inputRef.current && inputRef.current.value.trim()) {
            setPrompt(inputRef.current.value);
            inputRef.current.value = '';
            setPromptCount(promptCount + 1);
        }
    }

    useEffect(() => {
        const inputElement = inputRef.current;

        if (inputElement) {
            const keyDownEvent = (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    submitInput();
                }
            }

            inputElement.addEventListener("keydown", keyDownEvent);

            return () => inputElement.removeEventListener("keydown", keyDownEvent);
        }

    }, [promptCount, setPromptCount]);

    return (
        <div className={`
            fixed left-1/2 -translate-x-1/2 grid justify-center z-20
            transition-all duration-500 ease-in-out
            w-fit 
            bg-transparent rounded-full
            bg-cover bg-center
            ${getToBottom ? 'bottom-8' : 'bottom-1/3'}
        `}>
            <div className={`
            p-1
            duration-500
            rounded-full 
            flex justify-between items-center
            bg-walnut-accent-40
            border-walnut-dark
            border-3
            backdrop-blur-[2.3px]
            ${isFocused ? 'w-2xl' : 'w-xl'} 
            hover:w-2xl
            `}>
            <input
            ref={inputRef}
            type="text"
            placeholder="Ask anything..."
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="
                h-full
                flex-1
                px-4
                border-none
                rounded-full
                focus:outline-none
                focus:border-none
                transition
                duration-300
                text-walnut-dark
                font-bold
                placeholder:font-normal
                placeholder:font-lato
                ph-walnut
                bg-transparent
                font-lato
            "
            />
            <button onClick={() => submitInput()}
            className="
                rounded-full
                text-white
                h-8
                px-5
                m-1
                bg-walnut-dark
                duration-500
                hover:cursor-pointer
                font-pacifico
                ">Send
            </button>
            </div>
        </div>
    );
}

export default PromptField;