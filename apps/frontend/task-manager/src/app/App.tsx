import { useEffect, useMemo } from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkThemeConfig, lightThemeConfig } from "@task-manager/ant-config";
import { App as AntApp, theme as AntTheme, ConfigProvider, FloatButton } from "antd";
import { RouterProvider } from "react-router-dom";

import router from "./router";

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
		 
	}, []);

	useEffect(() => {
		useAuthStore.getState().getSession();
	}, []);

	return (
		<ConfigProvider theme={themeConfig}>
			<QueryClientProvider client={queryClient}>
				<AntApp className="h-full">
					<RouterProvider router={router} />

					<FloatButton icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />} onClick={toggleTheme} />
				</AntApp>
			</QueryClientProvider>
		</ConfigProvider>
	);
}

export default App;
