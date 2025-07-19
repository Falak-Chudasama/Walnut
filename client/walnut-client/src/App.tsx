import { useContext } from "react";
import components from "./components/components";
import { ModelContext, PromptCountContext } from "./context/context";
function App() {
	// const { model, setModel } = useContext(ModelContext)!;
	const { promptCount } = useContext(PromptCountContext)!;

	const [PromptField, WalnutTitleLogo, Chat] = components;

	return (
		<>
			<div className={`min-h-screen w-screen`}>
				<header className={`grid justify-center w-fit h-fit`}>
					{ WalnutTitleLogo(promptCount !== 0) }
				</header>
				<Chat/>
				{ PromptField(promptCount !== 0) }
			</div>
		</>
	);
};

export default App;