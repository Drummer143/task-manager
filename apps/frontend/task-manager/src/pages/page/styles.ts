import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	container: css`
		height: 100%;
		max-height: 100%;

		overflow: hidden auto;

		&:first-child {
			padding-top: var(--ant-padding);
		}

		& > * {
			padding-left: var(--ant-padding);
			padding-right: var(--ant-padding);
		}

		&:last-child {
			padding-bottom: var(--ant-padding);
		}
	`
}));