import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	taskList: css`
		padding: 0 var(--ant-padding-xxs);

		& > *:not(:last-child) {
			margin-bottom: var(--ant-margin-xs);
		}
	`
}));
