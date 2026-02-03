import React, { useMemo } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkThemeConfig, lightThemeConfig } from "@task-manager/ant-config";
import { App as AntApp, theme as antTheme, ThemeConfig } from "antd";
import { ThemeProvider } from "antd-style";

import { useAppStore } from "./store/app";

import UploadQueueWidget from "../widgets/UploadQueueWidget";

interface ProvidersProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchInterval: 60000
		}
	}
});

const Providers: React.FC<ProvidersProps> = props => {
	const { theme } = useAppStore();

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
				<AntApp className="h-full">
					{props.children}

					<UploadQueueWidget />
				</AntApp>
			</QueryClientProvider>
		</ThemeProvider>
	);
};

export default Providers;

