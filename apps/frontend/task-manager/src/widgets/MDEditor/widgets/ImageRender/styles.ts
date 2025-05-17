import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => {
	const buttonsContainer = css`
		position: absolute;

		top: 10px;
		right: 10px;

		padding: calc(var(--ant-padding-xxs) / 2);

		opacity: 0;
		transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-out);
		background-color: var(--ant-color-bg-container);
		box-shadow: var(--ant-box-shadow-secondary);
		border-radius: var(--ant-border-radius);
	`;

	return {
		wrapper: css`
			width: 50%;
			position: relative;
			height: auto;

			&:hover .acss-${buttonsContainer.name} {
				opacity: 1;
			}
		`,
		image: css`
			width: 100%;
			height: auto;
		`,
		buttonsContainer
	};
});

