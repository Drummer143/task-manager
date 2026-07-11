import React from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";

import styles from "./styles.module.scss";

import { useAppStore } from "../../../../app/store/app";

const ThemeToggle: React.FC = () => {
	const { theme, toggleTheme } = useAppStore();

	return (
		<div onClick={toggleTheme} className={styles.button}>
			{theme === "light" ? <MoonOutlined /> : <SunOutlined />}
		</div>
	);
};

export default ThemeToggle;

