import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => {
	const buttonsContainer = css`
		opacity: 0;
		transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-out);
	`;

	return {
		wrapper: css`
			height: 40px;
			padding: 0 var(--ant-padding);
			background: var(--ant-color-bg-container);

			&:hover .acss-${buttonsContainer.name} {
				opacity: 1;
			}
		`,
		buttonsContainer
	};
});

