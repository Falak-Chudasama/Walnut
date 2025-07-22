import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import contextProviders from './context/context.tsx'

const [PromptProvider, ModelProvider, PromptCountProvider, MemoryContext] = contextProviders;

createRoot(document.getElementById('root')!).render(
	<PromptProvider>
		<ModelProvider>
			<PromptCountProvider>
				<MemoryContext>
					<App/>
				</MemoryContext>
			</PromptCountProvider>
		</ModelProvider>
	</PromptProvider>,
);