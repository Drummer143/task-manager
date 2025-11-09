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
	`,
	newMessagesButtonWrapper: css`
		position: relative;
	`,
	newMessagesButton: css`
		position: absolute;
		left: 50%;
		transform: translate(-50%, -100%);
		top: -16px;
		z-index: 1;
	`
}));

