import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { TitleBar } from "./Components/Titlebar";
import { FarAimContextProvider } from "./Util/context/context.tsx";
import { airplaneIcon } from "./assets/icon.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<FarAimContextProvider>
			<TitleBar title={"FAR/AIM"} icon={airplaneIcon} />
			<div className="appspace">
				<App />
			</div>
		</FarAimContextProvider>
	</React.StrictMode>,
);
