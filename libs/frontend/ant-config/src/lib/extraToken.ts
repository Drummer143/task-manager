import { BaseThemeToken, ExtraThemeToken } from "./types";

export const base: BaseThemeToken = {
	fontSizeXs: "11px"
};

export const lightExtra: ExtraThemeToken = {
	...base,
	taskBoardColumnBg: "#F0F0F0",
	colorTaskGroupTitle: "rgba(255, 255, 255, 0.3)",
	taskBg: "#FCFCFC",
	colorBorderTertiary: "#E5E5E5",
	imageCropMaskColor: "rgba(0, 0, 0, 0.8)"
};

export const darkExtra: ExtraThemeToken = {
	...base,
	taskBoardColumnBg: "#090909",
	colorTaskGroupTitle: "rgba(0, 0, 0, 0.3)",
	taskBg: "#040404",
	colorBorderTertiary: "#1E1E1E",
	imageCropMaskColor: "rgba(0, 0, 0, 0.8)"
};