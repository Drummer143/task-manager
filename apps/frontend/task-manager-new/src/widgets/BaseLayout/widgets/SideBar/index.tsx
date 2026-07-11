import React from "react";

import styles from "./styles.module.scss";

import NavItems from "../NavItems";
import ThemeToggle from "../ThemeToggle";

const SideBar: React.FC = () => {
	return (
		<div className={styles.wrapper}>
			<NavItems />

			<ThemeToggle />
		</div>
	);
};

export default SideBar;

