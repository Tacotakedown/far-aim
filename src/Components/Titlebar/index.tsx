import { Window } from "@tauri-apps/api/window";
import React from "react";
import SearchBox from "../SearchBox";

type TitlebarProps = {
	title: string;
	icon: Element;
};

export const TitleBar: React.FC<TitlebarProps> = (props: TitlebarProps) => {
	const [appWindow, setAppWindow] = React.useState<Window | null>(null);
	React.useEffect(() => {
		const window = Window.getCurrent();
		setAppWindow(window);
	}, []);

	const handleMinimize = async () => {
		if (appWindow) await appWindow.minimize();
	};

	const handleMaximize = async () => {
		if (appWindow) {
			if (await appWindow.isMaximized()) {
				await appWindow.unmaximize();
			} else {
				await appWindow.maximize();
			}
		}
	};

	const handleClose = async () => {
		if (appWindow) await appWindow.close();
	};

	return (
		<div data-tauri-drag-region className="titlebar">
			<div className="titlebar-left-group">
				<div className="titlebar-icon">{props.icon}</div>
				<div className="titlebar-title"> {props.title}</div>
			</div>

			<div className="search-box-button-wrapper">
				<SearchBox />
				<div className="bookmark-button" onClick={() => {}}>
					🔖
				</div>
				<div className="titlebar-button-group">
					<div className="titlebar-button" onClick={handleMinimize}>
						<img
							src="https://api.iconify.design/mdi:window-minimize.svg"
							alt="minimize"
						/>
					</div>

					<div className="titlebar-button" onClick={handleMaximize}>
						<img
							src="https://api.iconify.design/mdi:window-maximize.svg"
							alt="maximize"
						/>
					</div>
					<div className="titlebar-button" onClick={handleClose}>
						<img src="https://api.iconify.design/mdi:close.svg" alt="close" />
					</div>
				</div>
			</div>
		</div>
	);
};
