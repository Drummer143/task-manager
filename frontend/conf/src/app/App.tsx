import { useEffect, useMemo } from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App as AntApp, theme as AntTheme, ConfigProvider, FloatButton, Layout, ThemeConfig } from "antd";
import { RouterProvider } from "react-router-dom";

import darkThemeConfig from "shared/antConfigs/darkThemeConfig";
import lightThemeConfig from "shared/antConfigs/lightThemeConfig";
import { useAppStore } from "store/app";
import { useAuthStore } from "store/auth";

import router from "./router";

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
		useAuthStore
			.getState()
			.getSession()
			.then(user => {
				if (user) return;

				const mainAppUrl = import.meta.env.VITE_MAIN_APP_URL;

				if (mainAppUrl) {
					window.location.href = mainAppUrl + "/login?next=" + encodeURIComponent(window.location.href);
				}
			});

		if (!theme) {
			setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ConfigProvider theme={themeConfig}>
			<QueryClientProvider client={queryClient}>
				<AntApp className="h-full">
					<Layout className="h-full">
						<RouterProvider router={router} />
					</Layout>
					<FloatButton icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />} onClick={toggleTheme} />
				</AntApp>
			</QueryClientProvider>
		</ConfigProvider>
	);
}

export default App;
