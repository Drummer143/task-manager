import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	cropWrapper: css`
		position: relative;

		width: 100%;
		height: 350px;

		margin-top: var(--ant-margin);
	`
}));
