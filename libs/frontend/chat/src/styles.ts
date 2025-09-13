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
	sentinel: css`
		position: absolute;
		top: 0;
		left: 0;
		height: 1px;
		width: 1px;
		opacity: 0;
	`,
	messageList: css`
		flex: 1;

		padding-bottom: var(--ant-padding-lg);

		overflow-y: auto;
	`,
	bottomContent: css`
		position: relative;
	`
	// seeNewMessagesButton: css`
	// 	position: absolute;
	// 	top: calc(-1 * var(--ant-padding-sm));
	// 	left: 50%;

	// 	transform: translate(-50%, -100%);
	// `
}));

