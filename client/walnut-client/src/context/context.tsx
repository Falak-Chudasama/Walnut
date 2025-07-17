import React, { createContext, useState, type ReactNode } from "react";
import constants from "../constants/constants";
import type { PromptContextType, ModelContextType, PromptCountType } from "../types/types";

// Contexts
export const PromptContext = createContext<PromptContextType | null>(null);
export const ModelContext = createContext<ModelContextType | null>(null);
export const PromptCountContext = createContext<PromptCountType | null>(null);

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
    const [model, setModel] = useState(constants.defaultModel);

    return (
        <ModelContext.Provider value={{ model, setModel }}>
            {children}
        </ModelContext.Provider>
    );
};

const PromptCountProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [promptCount, setPromptCount] = useState(0);

    return (
        <PromptCountContext.Provider value={{ promptCount, setPromptCount }}>
            {children}
        </PromptCountContext.Provider>
    );
};


const providers = [PromptProvider, ModelProvider, PromptCountProvider];
export default providers;