import { useContext, useState, useRef, useEffect } from "react";
import { PromptContext, PromptCountContext } from "../context/context";

function PromptField(getToBottom: boolean) {
    const { setPrompt } = useContext(PromptContext)!;
    const { promptCount, setPromptCount } = useContext(PromptCountContext)!;
    const [isFocused, setIsFocused] = useState(false);
    const [buttonHovered, setButtonHovered] = useState(false);
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

        if (promptCount === 0) {
            inputElement?.focus();
            setIsFocused(true);
        }

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
            scale-105
            fixed left-1/2 -translate-x-1/2 grid justify-center z-20
            transition-all duration-500 ease-in-out
            w-fit 
            bg-transparent rounded-full
            bg-cover bg-center
            hover:shadow-lg
            ${isFocused ? "shadow-lg" : "shadow-sm"}
            ${getToBottom ? 'bottom-12' : 'bottom-1/3'}
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
            placeholder="Ask her anything..."
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
                font-medium
                placeholder:font-normal
                placeholder:font-urbanist
                ph-walnut
                bg-transparent
                font-urbanist-light
            "
            />
                <button 
                onClick={() => submitInput()}
                onMouseEnter={() => setButtonHovered(true)}
                onMouseLeave={() => setButtonHovered(false)}
                className={`
                    rounded-full
                    text-white
                    h-8
                    w-8
                    m-1
                    flex items-center
                    justify-center
                    bg-walnut-dark
                    hover:bg-walnut-darker
                    scale-100
                    duration-200
                    hover:cursor-pointer
                    `}>
                        <img src="./send-icon.png" alt="send icon" className={`h-4.5 w-auto duration-200 ${ buttonHovered ? "ml-1.5" : "ml-0" }`}/>
                </button>
            </div>
        </div>
    );
}

export default PromptField;