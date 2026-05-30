import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	volumeBarContainer: css`
		height: 8px;
		background: #222;
		border-radius: 4px;
		overflow: hidden;
	`,
	volumeBar: css`
		height: 100%;

		background: #22c55e;
		transition: width 80ms linear;
	`,
	volumeBarErrorText: css`
		color: #ef4444;
		font-size: 12px;
	`,
	deviceSelect: css`
		max-width: 200px;
		min-width: 200px;
	`
}));

