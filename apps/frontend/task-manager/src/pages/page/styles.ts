import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	container: css`
		height: 100%;
		max-height: 100%;

		display: grid;
		grid-template-rows: min-content 1fr;

		padding: var(--ant-padding);

		overflow: hidden auto;
	`
}));