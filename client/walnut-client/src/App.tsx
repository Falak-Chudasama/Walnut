// import { useContext, useState } from "react";
// import getResponse from "./api/getResponse";
// import ReactMarkdown from "react-markdown";
import components from "./components/components";
// import { PromptContext, ModelContext } from "./context/context";

function App() {
	const [PromptField] = components;

	return (
		<>
			<div className="grid min-h-screen items-center justify-center">
				<div className="grid h-72 items-center justify-center">
					<div>
						<div className="flex items-center justify-center">
							<img src="./walnut.png" alt="walnut-logo" className="h-20" />
							<h1 className="ml-4">
								<span className="text-7xl text-walnut-accent font-pacifico">Wal</span>
								<span className="text-7xl text-walnut-dark font-pacifico">nut</span>
							</h1>
						</div>
						<h6 className="text-xl text-center font-lato font-normal text-walnut-accent mt-3">
							Let's <span className="text-walnut-dark">crack</span> a nut...
						</h6>
					</div>
					<PromptField></PromptField>
				</div>
			</div>
		</>
	);
};

export default App;