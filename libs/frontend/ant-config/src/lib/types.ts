export interface BaseThemeToken {
	fontSizeXs: string;
}

export interface ExtraThemeToken extends BaseThemeToken {
	taskBoardColumnBg: string;
	colorTaskGroupTitle: string;

	colorBorderTertiary: string;

	imageCropMaskColor: string;

	colorBgLayer1: string;
	colorBgLayer2: string;
	colorBgLayer3: string;

	colorBgLayer4: string;
	colorBgLayer4Hover: string;
	colorBgLayer4Active: string;

	colorBorderCustom: string;
}
