import * as React from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @nx/enforce-module-boundaries
import { darkThemeConfig, lightThemeConfig } from "@task-manager/ant-config";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { App, ConfigProvider } from "antd";
export * from "@testing-library/react";

export const renderWithAntd = (ui: React.ReactNode, theme: "light" | "dark" = "light") =>
	render(
		<ConfigProvider theme={theme === "light" ? lightThemeConfig : darkThemeConfig}>
			<App>{ui}</App>
		</ConfigProvider>
	);

