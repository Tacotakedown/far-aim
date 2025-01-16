import "./App.css";
import { useContext, useEffect } from "react";
import { FarAimContext } from "./Util/context/context.tsx";

export const App = () => {
	const context = useContext(FarAimContext);

	if (!context) {
		throw new Error("FarAimContext must be used within the context.");
	}

	useEffect(() => {
		console.log(context.searchActive);
	}, [context]);

	return (
		<div className="flex flex-col">
			Search: {context.searchText}
			{context.searchActive && <div>This is the search box</div>}
		</div>
	);
};
