import React, { useMemo } from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkThemeConfig, lightThemeConfig } from "@task-manager/ant-config";
import { App as AntApp, theme as antTheme, FloatButton, ThemeConfig } from "antd";
import { ThemeProvider } from "antd-style";
import { I18nextProvider } from "react-i18next";

import i18n from "./i18n";
import { useAppStore } from "./store/app";

interface ProvidersProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient();

const Providers: React.FC<ProvidersProps> = props => {
	const { theme, toggleTheme } = useAppStore();

	const themeConfig: ThemeConfig = useMemo(
		() => ({
			...(theme === "light" ? lightThemeConfig : darkThemeConfig),
			algorithm: theme === "light" ? undefined : antTheme.darkAlgorithm
		}),
		[theme]
	);

	return (
		<ThemeProvider theme={themeConfig} themeMode={theme}>
			<QueryClientProvider client={queryClient}>
				<I18nextProvider i18n={i18n}>
					<AntApp className="h-full">
						{props.children}
						<FloatButton
							icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
							onClick={toggleTheme}
						/>
					</AntApp>
				</I18nextProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
};

export default Providers;
