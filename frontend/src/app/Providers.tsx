import React, { useMemo } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme as antTheme, ConfigProvider } from "antd";

import darkThemeConfig from "shared/antConfigs/darkThemeConfig";
import lightThemeConfig from "shared/antConfigs/lightThemeConfig";
import { useAppStore } from "store/app";

interface ProvidersProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient();

const Providers: React.FC<ProvidersProps> = ({ children }) => {
	const theme = useAppStore(state => state.theme);

	const themeConfig: ThemeConfig = useMemo(
		() => ({
			...(theme === "light" ? lightThemeConfig : darkThemeConfig),
			algorithm: theme === "light" ? undefined : antTheme.darkAlgorithm
		}),
		[theme]
	);

	return (
		<ConfigProvider theme={themeConfig}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</ConfigProvider>
	);
};

export default Providers;
