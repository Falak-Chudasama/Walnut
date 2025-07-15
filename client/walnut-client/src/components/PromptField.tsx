import { useContext, useState } from "react";
import getResponse from "../api/getResponse";
import ReactMarkdown from "react-markdown";
import { PromptContext, ModelContext } from "../context/context";

function PromptField() {
    const { setPrompt } = useContext(PromptContext)!;

    const { prompt } = useContext(PromptContext)!;
    const { model } = useContext(ModelContext)!;
    const [response, setResponse] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    async function responseAnimation(response: string): Promise<void> {
        let currResponse: string = "";

        for (let i = 0; i < response.length; i++) {
            await setTimeout(() => {
                currResponse += response[i];
                setResponse(currResponse);
            }, i * 8);
        }
    }

    async function promptSubmission(prompt: string) {
        const response = await getResponse(prompt, model);
        responseAnimation(response);
    }

    return (
        <div className="grid justify-center">
            <div className={`${isFocused ? 'w-2xl' : 'w-xl'} hover:w-2xl duration-500 gradient-border`}>
                <div className="
                        duration-500
                        rounded-full 
                        flex justify-between items-center
                        gradient-border
                        inner
                        ">
                    <input
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
                    <button onClick={() => promptSubmission(prompt)}
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
            <ReactMarkdown>{response}</ReactMarkdown>
        </div>
    );
}

export default PromptField;