import type React from "react";
import { createContext, useState } from "react";

export type FarAimContextValue = {
	searchActive: boolean;
	searchText: string;
	book: "AIM" | "FAR" | "PCG" | "ACS" | "HOME";
	page: number;
	setContext: React.Dispatch<React.SetStateAction<FarAimContextValue>>;
};

export const FarAimContext = createContext<FarAimContextValue | undefined>(
	undefined,
);

type FarAimContextProviderProps = {
	children: React.ReactNode;
};
export const FarAimContextProvider: React.FC<FarAimContextProviderProps> = ({
	children,
}) => {
	const [context, setContext] = useState<FarAimContextValue>({
		searchActive: false,
		searchText: "",
		book: "HOME",
		page: 0,
		setContext: () => {},
	});

	return (
		<FarAimContext.Provider value={{ ...context, setContext }}>
			{children}
		</FarAimContext.Provider>
	);
};
