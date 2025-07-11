import { useState } from "react";
import constants from "./constants/constants";
import ReactMarkdown from "react-markdown";

function App() {
	const [prompt, setPrompt] = useState('');
	const [model, setModel] = useState('llama');
	const [response, setResponse] = useState('');

	async function getResponse(): void {
		// http request
		try {
			const res = await fetch(`${constants.origin}/ai`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					prompt: prompt,
					model: model
				})
			});

			if (!res.ok) {
				console.log(res);
				throw new Error('Server error');
			}

			const data = await res.json();
			responseAnimation(data.result);
		} catch (err) {
			console.error(err);
			responseAnimation('Error fetching response.');
		}
	}

	async function responseAnimation(response: string): Promise<void> {
		let currResponse: string = "";

		for (let i = 0; i < response.length; i++) {
			await setTimeout(() => {
				currResponse += response[i];
				setResponse(currResponse);
			}, i * 8);
		}
	}

	return (
		<>
			<input className="block" type="text" placeholder="Type anything..." onChange={ (e) => setPrompt(e.target.value) } />
			<button onClick={ () => getResponse() }>Submit</button>
			<ReactMarkdown>{ response }</ReactMarkdown>
		</>
	);
};

export default App;