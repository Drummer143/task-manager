import { BaseThemeToken, ExtraThemeToken } from "./types";

export const base: BaseThemeToken = {
	fontSizeXs: "11px"
};

export const lightExtra: ExtraThemeToken = {
	...base,
	taskBoardColumnBg: "#F0F0F0",
	colorTaskGroupTitle: "rgba(255, 255, 255, 0.3)",
	colorBorderTertiary: "#E5E5E5",
	imageCropMaskColor: "rgba(0, 0, 0, 0.8)",
	// TODO: add colorBgLayer1, colorBgLayer2, colorBgLayer3, colorBgLayer4
	colorBgLayer1: "transparent",
	colorBgLayer2: "transparent",
	colorBgLayer3: "transparent",

	colorBgLayer4: "#FCFCFC",
	colorBgLayer4Hover: "#F0F0F0",
	colorBgLayer4Active: "#F0F0F0",

	colorBorderCustom: "transparent"
};

export const darkExtra: ExtraThemeToken = {
	...base,
	taskBoardColumnBg: "#141414",
	colorTaskGroupTitle: "rgba(0, 0, 0, 0.3)",
	colorBorderTertiary: "#1E1E1E",
	imageCropMaskColor: "rgba(0, 0, 0, 0.8)",
	colorBgLayer1: "#000",
	colorBgLayer2: "#0A0A0A",
	colorBgLayer3: "#141414",

	colorBgLayer4: "#1F1F1F",
	colorBgLayer4Hover: "#262626",
	colorBgLayer4Active: "#202020",

	colorBorderCustom: "#1F1F1F"
};

