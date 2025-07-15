import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import contextProviders from './context/context.tsx'

const [PromptProvider, ModelContext] = contextProviders;

createRoot(document.getElementById('root')!).render(
	<PromptProvider>
		<ModelContext>
			<App/>
		</ModelContext>
	</PromptProvider>,
);