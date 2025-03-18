import { ThemeConfig as BaseThemeConfig } from "antd";

declare global {
	interface ExtraThemeToken {
		colorDone?: string;
		colorInProgress?: string;
		colorNotDone?: string;
		imageCropMaskColor?: string;
		colorTaskGroupTitle?: string;
	}

	interface ThemeConfig extends BaseThemeConfig {
		token?: import("antd").ThemeConfig["token"] & ExtraThemeToken;
	}
}

export {};
