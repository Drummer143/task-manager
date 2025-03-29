import { useEffect, useMemo } from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkThemeConfig, lightThemeConfig } from "@task-manager/ant-config";
import { App as AntApp, theme as AntTheme, FloatButton, ThemeConfig } from "antd";
import { ThemeProvider } from "antd-style";
import { RouterProvider } from "react-router-dom";

import router from "./router";
import { useSocketStore } from "./store/socket";

import { useAppStore } from "../app/store/app";
import { useAuthStore } from "../app/store/auth";

const queryClient = new QueryClient();

function App() {
	const { theme, setTheme, toggleTheme } = useAppStore();

	const themeConfig: ThemeConfig = useMemo(
		() => ({
			...(theme === "light" ? lightThemeConfig : darkThemeConfig),
			algorithm: theme === "light" ? undefined : AntTheme.darkAlgorithm
		}),
		[theme]
	);

	useEffect(() => {
		if (!theme) {
			setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		}

		useAuthStore.getState().getSession();

		useSocketStore.getState().init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// <ConfigProvider theme={themeConfig}>
	return (
		<ThemeProvider theme={themeConfig} themeMode={theme}>
			<QueryClientProvider client={queryClient}>
				<AntApp className="h-full">
					<RouterProvider router={router} />

					<FloatButton icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />} onClick={toggleTheme} />
				</AntApp>
			</QueryClientProvider>
		</ThemeProvider>
	);
	// </ConfigProvider>
}

export default App;
