import { useContext } from "react";
import components from "./components/components";
import { ModelContext, PromptCountContext } from "./context/context";
import constants from "./constants/constants";

function App() {
	// const { model, setModel } = useContext(ModelContext)!;
	const { promptCount } = useContext(PromptCountContext)!;

	const [PromptField, WalnutTitleLogo, Chat, NewChat, SwitchModel] = components;

	return (
		<>
			<div className={`min-h-screen w-screen`}>
				<header className={`grid justify-center w-fit h-fit`}>
					{ WalnutTitleLogo(promptCount !== 0) }
				</header>
				<NewChat />
				<SwitchModel />
				<Chat />
				{ PromptField(promptCount !== 0) }
				<p className="text-walnut-dark font-medium absolute bottom-3 text-center w-full">Walnut v{constants.appVersion}</p>
			</div>
		</>
	);
};

export default App;