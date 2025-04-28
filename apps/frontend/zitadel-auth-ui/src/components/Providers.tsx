"use client";

import React, { useMemo, useState } from "react";

import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { BrandingSettings, ThemeMode } from "@task-manager/zitadel-api/zitadel/settings/v2/branding_settings_pb";
import { theme as antTheme, FloatButton, ThemeConfig } from "antd";
import { ThemeProvider } from "antd-style";

import { darkThemeConfig, lightThemeConfig } from "@task-manager/ant-config";

interface ProvidersProps {
	children: React.ReactNode;

	branding?: BrandingSettings;
}

const getBrandingThemeMode = (theme?: ThemeMode) => {
	switch (theme) {
		case ThemeMode.AUTO: {
			return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		}
		case ThemeMode.LIGHT:
			return "light";
		case ThemeMode.UNSPECIFIED:
		case ThemeMode.DARK:
		default:
			return "dark";
	}
};

const Providers: React.FC<ProvidersProps> = ({ children, branding }) => {
	const [theme, setTheme] = useState<"light" | "dark">(getBrandingThemeMode(branding?.themeMode));

	const themeConfig: ThemeConfig = useMemo(
		() => ({
			...(theme === "light"
				? {
						...lightThemeConfig,
						token: {
							...lightThemeConfig.token,
							colorTextBase: branding?.lightTheme?.fontColor ?? lightThemeConfig.token?.colorTextBase,
							colorBgBase: branding?.lightTheme?.backgroundColor ?? lightThemeConfig.token?.colorBgBase,
							colorWarning: branding?.lightTheme?.warnColor ?? lightThemeConfig.token?.colorWarning
						}
					}
				: {
						...darkThemeConfig,
						token: {
							...darkThemeConfig.token,
							colorTextBase: branding?.darkTheme?.fontColor ?? darkThemeConfig.token?.colorTextBase,
							colorBgBase: branding?.darkTheme?.backgroundColor ?? darkThemeConfig.token?.colorBgBase,
							colorWarning: branding?.darkTheme?.warnColor ?? darkThemeConfig.token?.colorWarning
						}
					}),
			algorithm: theme === "light" ? undefined : antTheme.darkAlgorithm
		}),
		[branding, theme]
	);

	return (
		<ThemeProvider theme={themeConfig} themeMode={theme}>
			{children}

			<FloatButton
				icon={theme === "light" ? <MoonOutlined /> : <SunOutlined />}
				onClick={() => setTheme(theme === "light" ? "dark" : "light")}
			/>
		</ThemeProvider>
	);
};

export default Providers;

