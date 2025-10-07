import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		position: relative;

		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;

		overflow: hidden;
	`,
	messageList: css`
		max-height: 100%;

		padding-bottom: var(--ant-padding-lg);

		overflow-y: auto;
	`,
	bottomContent: css`
		position: relative;
	`
}));

