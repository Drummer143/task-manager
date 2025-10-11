import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		display: grid;
		justify-content: center;
		align-items: center;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--ant-padding);

		padding: var(--ant-padding) 0;

		&::before,
		&::after {
			content: "";

			width: 100%;
			height: 0;

			border-bottom: 1px solid var(--ant-color-split);
			transform: translateY(50%);
		}
	`
}));

