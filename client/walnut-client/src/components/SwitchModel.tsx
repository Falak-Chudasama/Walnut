import { useContext, useEffect, useState } from "react";
import { PromptCountContext, ModelContext } from "../context/context";
import constants from "../constants/constants";

function SwitchModel() {
    const [showModels, setShowModels] = useState(false);
    const { promptCount, setPromptCount } = useContext(PromptCountContext)!;
    const { model, setModel } = useContext(ModelContext)!;
    const [modelOptions, setModelOptions] = useState([]);

    const models: Record<string, string> = {}

    for (let model in constants.groqModels) {
        models[model] = "";
    }
    for (let model in constants.githubModels) {
        models[model] = "";
    }
    for (let model in constants.openRouterModels) {
        models[model] = "";
    }

    function getModelsOptions() {
        const options = [];
        let idx: number = 0;
        for (let currModel in models) {
            if (currModel === model) continue;
            else {
                ++idx;
                options.push(
                    <div
                        onClick={() => {setModel(currModel); setShowModels(false)}}
                        className={`
                    cursor-pointer
                    transition-all duration-500 ease-in-out
                    hover:bg-walnut-darker
                    ${showModels ? "translate-x-0" : "-translate-x-full"}
                    flex items-center justify-between text-xl font-pacifico
                    bg-walnut-dark rounded-tr-full rounded-br-full
                    min-w-30 w-fit p-2 text-walnut-pale
                    mb-1
                `}
                    >
                        {currModel}
                        <div className="rounded-full bg-walnut-pale h-7 w-7 ml-4 flex items-center justify-center hover:scale-110 duration-200">
                            <img className="h-4.5 w-auto" src={`${models[currModel]}`} alt="model logo" />
                        </div>
                    </div>
                )
            }
        }

        setModelOptions(options);
    }

    useEffect(() => {
        getModelsOptions();
    }, [model, showModels]);

    return (
        <div className={`group absolute ${promptCount === 0  ? "top-[20%]" : "top-[30%]"} duration-500 left-0 w-max h-max z-50`}>
            <div
                onClick={() => setShowModels(!showModels)}
                className={`
                    cursor-pointer
                    transition-all duration-500 ease-in-out
                    -translate-x-20
                    group-hover:translate-x-0
                    ${showModels ? "translate-x-0" : "-translate-x-20"}
                    flex items-center justify-between text-xl font-pacifico
                    bg-walnut-dark rounded-tr-full rounded-br-full
                    min-w-30 w-fit p-2 text-walnut-pale
                    mb-3
                `}
            >
                {model}
                <div className="rounded-full bg-walnut-pale h-7 w-7 ml-4 flex items-center justify-center hover:scale-110 duration-200">
                    <img className="h-4.5 w-auto" src={`${models[model]}`} alt="model logo" />
                </div>
            </div>
            {modelOptions}
        </div>
    );
}

export default SwitchModel;