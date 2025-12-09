import { useContext, useEffect } from "react";
import components from "./components/components";
import { PromptCountContext, ModelContext, MessageContext } from "./context/context";
import constants from "./constants/constants";
import SideButtons from "./components/SideButtons";

function App() {
	const { promptCount, setPromptCount } = useContext(PromptCountContext)!;
	const { model, setModel } = useContext(ModelContext)!;
	const { messages, setMessages } = useContext(MessageContext)!;
	const [PromptField, WalnutTitleLogo, Chat, NewChat, SwitchModel] = components;

	useEffect(() => {
		if (sessionStorage.getItem('promptCount')) {
			setPromptCount(Number(sessionStorage.getItem('promptCount')!));
		}
		if (sessionStorage.getItem('model')) {
			setModel(sessionStorage.getItem('model')!);
		}
		if (sessionStorage.getItem('messages')) {
			setMessages(JSON.parse(sessionStorage.getItem('messages')!));
		}
	}, []);

	useEffect(() => {
		sessionStorage.setItem('promptCount', `${promptCount}`);
	}, [promptCount]);

	useEffect(() => {
		sessionStorage.setItem('model', `${model}`);
	}, [model]);

	useEffect(() => {
		sessionStorage.setItem('messages', JSON.stringify(messages));
	}, [messages]);

	return (
		<>
			<div className={`min-h-screen w-screen`}>
				<header className={`grid justify-center w-fit h-fit`}>
					{WalnutTitleLogo(promptCount !== 0)}
				</header>
				<NewChat />
				<SwitchModel />
				<SideButtons />
				<Chat />
				{PromptField(promptCount !== 0)}
				<p className="text-walnut-dark font-medium absolute bottom-3 text-center w-full">Walnut v{constants.appVersion}</p>
			</div>
		</>
	);
};

export default App;