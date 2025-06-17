import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }, { opened }: { opened: boolean }) => {
	const buttonsContainer = css`
		opacity: 0;
		transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-out);
	`;

	return {
		wrapper: css`
			height: var(--ant-control-height-lg);
			padding: 0 var(--ant-padding);
			background: var(--ant-color-bg-container);
			border-radius: ${opened ? "var(--ant-border-radius) var(--ant-border-radius) 0 0" : "var(--ant-border-radius)"};

			&:hover .acss-${buttonsContainer.name} {
				opacity: 1;
			}
		`,
		buttonsContainer
	};
});

