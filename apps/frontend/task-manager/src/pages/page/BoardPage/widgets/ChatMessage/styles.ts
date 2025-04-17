import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => {
	const dateView = css`
		margin-left: var(--ant-margin-xs);

		opacity: 0;
		transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-in-out);
	`;

	return {
		wrapper: css`
			display: flex;
			gap: var(--ant-margin-xs);

			&:hover .acss-${dateView.name} {
				opacity: 1;
			}
		`,
		dateView
	};
});