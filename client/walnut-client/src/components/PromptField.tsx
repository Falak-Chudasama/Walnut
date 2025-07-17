import { useContext, useState, useRef, useEffect } from "react";
import { PromptContext, PromptCountContext } from "../context/context";

function PromptField(getToBottom: boolean) {
    const { setPrompt } = useContext(PromptContext)!;
    const { promptCount, setPromptCount } = useContext(PromptCountContext)!;
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const sendBtn = inputRef.current;
        
        if (sendBtn) {
            const keyDownEvent = (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    setPromptCount(promptCount + 1);
                }
            }

            sendBtn.addEventListener("keydown", keyDownEvent);

            return () => sendBtn.removeEventListener("keydown", keyDownEvent);
        }

    }, [promptCount, setPromptCount]);

    return (
        <div className={`
            fixed bottom-60 left-0 right-0 grid justify-center
            transition-transform duration-500 ease-in-out
            ${!getToBottom ? 'translate-y-0' : 'translate-y-[calc(50vh-5rem)]'}
        `}>
            <div className={`${isFocused ? 'w-2xl' : 'w-xl'} hover:w-2xl duration-500 gradient-border`}>
                <div className="
                        duration-500
                        rounded-full 
                        flex justify-between items-center
                        gradient-border
                        inner
                        ">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask anything..."
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="
                            h-full
                            w-2xl
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
                            bg-none
                            font-lato
                        "
                    />
                    <button onClick={() => setPromptCount(promptCount + 1)}
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
        </div>
    );
}

export default PromptField;