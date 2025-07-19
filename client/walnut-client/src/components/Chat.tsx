import { useContext, useState, useEffect, useRef, type JSX } from "react";
import ReactMarkdown from "react-markdown";
import getResponse from "../api/getResponse";
import { PromptContext, ModelContext, PromptCountContext } from "../context/context";

interface Message {
    type: 'prompt' | 'response';
    content: string;
    isAnimating?: boolean;
}

function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const { prompt } = useContext(PromptContext)!;
    const { promptCount } = useContext(PromptCountContext)!;
    const { model } = useContext(ModelContext)!;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function responseAnimation(response: string): Promise<void> {
        let currResponse: string = "";

        // Add the response message with empty content initially
        setMessages(prev => [...prev, { type: 'response', content: '', isAnimating: true }]);

        for (let i = 0; i < response.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 8));
            currResponse += response[i];
            setCurrentResponse(currResponse);
            
            // Update the last message (which should be the response being animated)
            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.type === 'response') {
                    newMessages[lastIndex] = { 
                        type: 'response', 
                        content: currResponse, 
                        isAnimating: true 
                    };
                }
                return newMessages;
            });
        }

        setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            if (newMessages[lastIndex]?.type === 'response') {
                newMessages[lastIndex] = { 
                    type: 'response', 
                    content: currResponse, 
                    isAnimating: false 
                };
            }
            return newMessages;
        });
        
        setCurrentResponse('');
    }

    useEffect(() => {
        // Add the new prompt to messages
        if (prompt && promptCount !== 0) {
            setMessages(prev => [...prev, { type: 'prompt', content: prompt }]);

            async function fetchAndAnimateResponse() {
                const response = await getResponse(prompt, model);
                responseAnimation(response);
            }

            fetchAndAnimateResponse();
        }
    }, [promptCount]);

    const createPromptDiv = (prompt: string): JSX.Element => {
        return (
            <div className="ml-auto font-lato font-medium italic p-3 bg-walnut-accent text-white max-w-[70%] rounded-2xl break-words">
                <ReactMarkdown>{prompt}</ReactMarkdown>
            </div>
        );
    };
    
    const createResponseDiv = (response: string): JSX.Element => {
        return (
            <div className="mr-auto p-3 font-medium text-walnut-dark max-w-[100%] break-words">
                <ReactMarkdown>{response}</ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="w-[calc(100vw-10rem)] h-[calc(85vh)] mx-[5rem] mt-[15vh] relative">
            <div 
                className="h-full overflow-y-auto overflow-x-hidden"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitScrollbar: 'none'
                }}
            >
                <style>{`
                    .chat-container::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                <div className="chat-container space-y-4 mb-36">
                    {messages.map((message, index) => (
                        <div key={index} className="w-full flex">
                            {message.type === 'prompt' 
                                ? createPromptDiv(message.content)
                                : createResponseDiv(message.content)
                            }
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    );
}

export default Chat;