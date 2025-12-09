import { useContext, useState, useEffect, useRef, type JSX } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import getResponse from "../apis/apis";
import {
    PromptContext,
    ModelContext,
    PromptCountContext,
    MessageContext,
} from "../context/context";
import { ChatMetaContext } from "../context/ChatMetaContext";

function Chat() {
    const { messages, setMessages } = useContext(MessageContext);
    const [currentResponse, setCurrentResponse] = useState("");
    const { prompt } = useContext(PromptContext)!;
    const { promptCount } = useContext(PromptCountContext)!;
    const { model } = useContext(ModelContext)!;
    const { chatTitle, setChatTitle, chatCreationDateTime, setChatCreationDateTime } =
        useContext(ChatMetaContext);

    const scrollRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastProcessedRef = useRef<number>(-1);
    const isProcessingRef = useRef<boolean>(false);

    useEffect(() => {
        if (promptCount === 0) setMessages([]);
    }, [promptCount]);

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
        if (!prompt) return;
        if (lastProcessedRef.current === promptCount) return;
        if (isProcessingRef.current) return;

        lastProcessedRef.current = promptCount;
        isProcessingRef.current = true;

        setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.type === "prompt" && last.content === prompt) return prev;
            return [...prev, { type: "prompt", content: prompt }];
        });

        const chatCountToSend = Math.max(0, promptCount - 1);

        (async () => {
            try {
                const response = await getResponse(
                    prompt,
                    model,
                    chatTitle,
                    chatCreationDateTime,
                    chatCountToSend
                );

                if (
                    chatCountToSend === 0 &&
                    response?.chatTitle &&
                    response?.chatCreationDateTime
                ) {
                    setChatTitle(response.chatTitle);
                    setChatCreationDateTime(response.chatCreationDateTime);
                }

                await responseAnimation(response?.response || "");
            } catch (err) {
                setMessages((prev) => [
                    ...prev,
                    {
                        type: "response",
                        content: "Failed to get response",
                        isAnimating: false,
                    },
                ]);
            } finally {
                isProcessingRef.current = false;
            }
        })();
    }, [promptCount]);

    const copyToClipboard = async (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
            } catch {
                fallbackCopyToClipboard(text);
            }
        } else {
            fallbackCopyToClipboard(text);
        }
    };

    const fallbackCopyToClipboard = (text: string) => {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    };

    const createPromptDiv = (prompt: string): JSX.Element => (
        <div className="group flex flex-col items-end max-w-[70%] ml-auto h-max space-y-1">
            <div className="font-urbanist font-medium p-3 px-5 bg-walnut-accent-darker text-white rounded-4xl break-words transition-all duration-300 shadow-md">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mr-5">
                <button
                    title="Copy prompt"
                    onClick={() => copyToClipboard(prompt)}
                    className="cursor-pointer p-1 rounded-md hover:brightness-75 hover:bg-walnut-accent-40 duration-200 flex items-center space-x-1"
                >
                    <img src="./copy-text-accent-icon.png" alt="Copy" className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    const createResponseDiv = (response: string): JSX.Element => (
        <div className="group flex flex-col items-start max-w-[100%] mr-auto h-max space-y-1">
            <div className="font-urbanist font-medium p-3 px-5 text-walnut-dark bg-walnut-accent-100 rounded-4xl break-words transition-all duration-300">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{response}</ReactMarkdown>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-5">
                <button
                    title="Copy response"
                    onClick={() => copyToClipboard(response)}
                    className="cursor-pointer p-1 rounded-md hover:brightness-75 hover:bg-walnut-accent-40 duration-200 flex items-center space-x-1"
                >
                    <img src="./copy-text-icon.png" alt="Copy" className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    return promptCount !== 0 ? (
        <div className="w-[calc(100vw-18rem)] h-[calc(85vh)] mx-[9rem] mt-[15vh] relative z-10">
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto overflow-x-hidden no-scrollbar"
            >
                <div className="chat-container space-y-4 mb-36 text-lg">
                    {messages.map((message, index) => {
                        const isPrompt =
                            message.type === "prompt" ||
                            message.role === "user";

                        const isResponse =
                            message.type === "response" ||
                            message.role === "assistant";

                        return (
                            <div key={index} className="w-full flex">
                                {isPrompt
                                    ? createPromptDiv(message.content)
                                    : createResponseDiv(message.content)}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    ) : (
        <></>
    );
}

export default Chat;