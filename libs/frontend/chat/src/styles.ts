import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;
		gap: var(--ant-padding-sm);

		overflow: hidden;
	`,
	messageList: css`
		flex: 1;

		overflow-y: auto;
	`,
	bottomContent: css`
		position: relative;
	`,
	seeNewMessagesButton: css`
		position: absolute;
		top: calc(-1 * var(--ant-padding-sm));
		left: 50%;

		transform: translate(-50%, -100%);
	`
}));

