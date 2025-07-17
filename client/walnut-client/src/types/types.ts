export interface PromptContextType {
    prompt: string;
    setPrompt: (val: string) => void;
};

export interface ModelContextType {
    model: string;
    setModel: (val: string) => void;
};

export interface PromptCountType {
    promptCount: number;
    setPromptCount: (val: number) => void;
}