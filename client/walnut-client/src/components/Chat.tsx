import { useContext, useState, useEffect, useRef, type JSX } from "react";
import ReactMarkdown from "react-markdown";
import getResponse from "../apis/apis";
import {
    PromptContext,
    ModelContext,
    PromptCountContext,
} from "../context/context";

interface Message {
    type: "prompt" | "response";
    content: string;
    isAnimating?: boolean;
}

function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentResponse, setCurrentResponse] = useState("");
    const { prompt } = useContext(PromptContext)!;
    const { promptCount } = useContext(PromptCountContext)!;
    const { model } = useContext(ModelContext)!;

    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (promptCount === 0) setMessages([]);
    }, [promptCount]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            requestAnimationFrame(() => {
                scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
            });
        }
    }, [messages]);

    async function responseAnimation(response: string): Promise<void> {
        let currResponse = "";

        setMessages((prev) => [
            ...prev,
            { type: "response", content: "", isAnimating: true },
        ]);

        for (let i = 0; i < response.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 8));
            currResponse += response[i];
            setCurrentResponse(currResponse);

            setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.type === "response") {
                    newMessages[lastIndex] = {
                        type: "response",
                        content: currResponse,
                        isAnimating: true,
                    };
                }
                return newMessages;
            });
        }

        setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            if (newMessages[lastIndex]?.type === "response") {
                newMessages[lastIndex] = {
                    type: "response",
                    content: currResponse,
                    isAnimating: false,
                };
            }
            return newMessages;
        });

        setCurrentResponse("");
    }

    useEffect(() => {
        if (prompt && promptCount !== 0) {
            setMessages((prev) => [...prev, { type: "prompt", content: prompt }]);

            async function fetchAndAnimateResponse() {
                const response = await getResponse(prompt, model);
                responseAnimation(response?.response);
            }

            fetchAndAnimateResponse();
        }
    }, [promptCount]);

    const copyToClipboard = async (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                console.log("[Clipboard] Copied via Clipboard API");
            } catch (err) {
                console.warn("[Clipboard] Clipboard API failed, using fallback:", err);
                fallbackCopyToClipboard(text);
            }
        } else {
            fallbackCopyToClipboard(text);
        }
    };

    const fallbackCopyToClipboard = (text: string) => {
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.left = "-9999px";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            console.log("[Clipboard] Copied via fallback method");
        } catch (err) {
            console.error("[Clipboard] Fallback copy failed:", err);
        }
    };

    const createPromptDiv = (prompt: string): JSX.Element => (
        <div className="group flex flex-col items-end max-w-[70%] ml-auto h-max space-y-1">
            <div
                className="
                    font-urbanist font-medium p-3 px-5
                    bg-walnut-accent-darker text-white rounded-4xl break-words 
                    transition-all duration-300 shadow-md
                "
            >
                <ReactMarkdown>{prompt}</ReactMarkdown>
            </div>

            <button
                title="Copy prompt"
                onClick={() => copyToClipboard(prompt)}
                className="
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-300 cursor-pointer
                    hover:brightness-75
                "
            >
                <img
                    src="./copy-text-accent-icon.png"
                    alt="Copy"
                    className="h-4 w-auto mr-3 mt-1 duration-200 hover:scale-115"
                />
            </button>
        </div>
    );

    const createResponseDiv = (response: string): JSX.Element => (
        <div className="group mr-auto p-3 font-medium text-walnut-dark max-w-[100%] break-words space-y-2 relative">
            <ReactMarkdown>{response}</ReactMarkdown>

            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    className="cursor-pointer h-5 w-5 ml-2 hover:brightness-50 duration-200 hover:scale-115"
                >
                    <img src="./speak-aloud-icon.png" alt="Speak" />
                </button>

                <button
                    className="cursor-pointer w-4 p-3 ml-2 rounded-md hover:brightness-50 hover:bg-walnut-accent-40 duration-200"
                    onClick={() => copyToClipboard(response)}
                >
                    <img src="./copy-text-icon.png" alt="Copy" />
                </button>
            </div>
        </div>
    );

    return promptCount !== 0 ? (
        <div className="w-[calc(100vw-18rem)] h-[calc(85vh)] mx-[9rem] mt-[15vh] relative">
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto overflow-x-hidden [overflow-anchor:none]"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                <style>{`
                    .chat-container::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                <div className="chat-container space-y-4 mb-36 text-lg">
                    {messages.map((message, index) => (
                        <div key={index} className="w-full flex">
                            {message.type === "prompt"
                                ? createPromptDiv(message.content)
                                : createResponseDiv(message.content)}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
}

export default Chat;