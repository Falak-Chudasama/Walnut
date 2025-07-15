import React, { createContext, useState, type ReactNode } from "react";
import type { PromptContextType, ModelContextType } from "../types/types";

// Contexts
export const PromptContext = createContext<PromptContextType | null>(null);
export const ModelContext = createContext<ModelContextType | null>(null);

// Providers
const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [prompt, setPrompt] = useState("");

    return (
        <PromptContext.Provider value={{ prompt, setPrompt }}>
            {children}
        </PromptContext.Provider>
    );
};

const ModelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [model, setModel] = useState("llama3");

    return (
        <ModelContext.Provider value={{ model, setModel }}>
            {children}
        </ModelContext.Provider>
    );
};


const providers = [PromptProvider, ModelProvider];
export default providers;