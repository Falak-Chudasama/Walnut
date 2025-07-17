import { useContext, useState, useEffect } from "react";
import getResponse from "./api/getResponse";
import ReactMarkdown from "react-markdown";
import components from "./components/components";
import { PromptContext, ModelContext, PromptCountContext } from "./context/context";
function App() {
	const { prompt } = useContext(PromptContext)!;
	const { model, setModel } = useContext(ModelContext)!;
	const { promptCount } = useContext(PromptCountContext)!;
	const [response, setResponse] = useState('');

	const [PromptField, WalnutTitleLogo] = components;


	async function responseAnimation(response: string): Promise<void> {
		let currResponse: string = "";

		for (let i = 0; i < response.length; i++) {
			await new Promise(resolve => setTimeout(resolve, 8));
			currResponse += response[i];
			setResponse(currResponse);
		}
	}

	useEffect(() => {
		async function fetchAndAnimateResponse() {
			const response = await getResponse(prompt, model);
			responseAnimation(response);
		}
		
		if (promptCount !== 0) {
			fetchAndAnimateResponse();
		}
	}, [promptCount]);

	return (
		<>
			<div className={`grid min-h-screen w-full justify-center`}>
				<div className="grid h-72 items-center justify-center">
					{ promptCount === 0 ? WalnutTitleLogo(false) : WalnutTitleLogo(true) }
					<ReactMarkdown>{response}</ReactMarkdown>
					{ promptCount === 0 ? PromptField(false) : PromptField(true) }
				</div>
			</div>
		</>
	);
};

export default App;