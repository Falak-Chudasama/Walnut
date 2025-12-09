import { createContext, useState } from "react";

export const ChatMetaContext = createContext<any>(null);

export default function ChatMetaProvider({ children }) {
    const [chatTitle, setChatTitle] = useState(sessionStorage.getItem("chatTitle") || "");
    const [chatCreationDateTime, setChatCreationDateTime] = useState(sessionStorage.getItem("chatCreationDateTime") || "");

    return (
        <ChatMetaContext.Provider value={{
            chatTitle,
            setChatTitle,
            chatCreationDateTime,
            setChatCreationDateTime
        }}>
            {children}
        </ChatMetaContext.Provider>
    );
}