import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import contextProviders from './context/context.tsx';
import ChatMetaProvider from "./context/ChatMetaContext";

const [PromptProvider, ModelProvider, PromptCountProvider, MessageContextProvider] = contextProviders;

createRoot(document.getElementById('root')!).render(
    <PromptProvider>
        <ModelProvider>
            <PromptCountProvider>
                <MessageContextProvider>
                    <ChatMetaProvider>
                        <App/>
                    </ChatMetaProvider>
                </MessageContextProvider>
            </PromptCountProvider>
        </ModelProvider>
    </PromptProvider>,
);