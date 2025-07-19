import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => {
	const addColumnButton = css`
		opacity: 0;
		transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-in-out);
	`;

	return {
		wrapper: css`
			width: min-content;

			height: 100%;

			display: flex;
			align-items: center;
			gap: var(--ant-padding-xs);
			flex-direction: column;

			&::before,
			&::after {
				content: "";

				flex: 1;

				width: 1px;

				background-color: var(--ant-color-split);
			}

			&:hover .acss-${addColumnButton.name} {
				opacity: 1;
			}
		`,
		addColumnButton
	};
});

