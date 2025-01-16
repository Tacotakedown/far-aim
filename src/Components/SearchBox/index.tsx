import type React from "react";
import { useContext, useState } from "react";
import { FarAimContext } from "../../Util/context/context.tsx";
import "./SearchBox.css";
import { SearchIcon } from "../../assets/search.tsx";

const SearchBox = () => {
	const context = useContext(FarAimContext);
	if (!context) {
		return null;
	}
	const [isActive, setIsActive] = useState(false);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		context.setContext({ ...context, searchText: e.target.value });
	};

	const handleFocus = () => {
		setIsActive(true);
		if (!context.searchActive)
			context.setContext({ ...context, searchActive: true });
	};

	const handleBlur = () => {
		setIsActive(false);
		if (context.searchActive)
			context.setContext({ ...context, searchActive: false });
	};

	return (
		<div className={`search-box ${isActive ? "active" : ""}`}>
			<span className="search-box-icon">{SearchIcon}</span>

			<input
				type="text"
				placeholder="Search"
				className="search-input"
				onChange={handleInputChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
		</div>
	);
};

export default SearchBox;
