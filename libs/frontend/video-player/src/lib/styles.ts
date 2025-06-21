import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }, { loading }: { loading: boolean }) => ({
	wrapper: css`
		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;

		height: fit-content;
	`,
	overlay: css`
		position: absolute;
		inset: 0;
		z-index: 1;

		${loading && "background-color: rgba(0, 0, 0, 0.4);"}
		user-select: none;
	`,
	loaderWrapper: css`
		width: 100%;
		height: 100%;
	`,
	optionsMenu: css`
		position: absolute;
		top: 0;
		right: 0;
		z-index: 2;
	`,
	video: css`
		user-select: none;
	`
}));

