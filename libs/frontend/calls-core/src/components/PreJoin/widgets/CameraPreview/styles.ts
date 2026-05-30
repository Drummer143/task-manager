import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	videoContainer: css`
		width: 100%;
		max-width: 750px;

		display: flex;
		align-items: center;
		justify-content: center;
		background: #000;

		padding: 0 16px;

		border-radius: 8px;
		color: #aaa;
		text-align: center;
	`,
	video: css`
		width: 100%;
		height: 100%;

		object-fit: cover;
		border-radius: 8px;
	`
}));

