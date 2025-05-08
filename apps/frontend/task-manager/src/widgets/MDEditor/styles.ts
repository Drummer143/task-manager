import { createStyles } from "antd-style";

interface UseStylesParams {
	emptyNodeClass: string;
}

export const useFileRendererStylets = createStyles(({ css }) => {
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

export const useStyles = createStyles(({ css }, { emptyNodeClass }: UseStylesParams) => {
	const placeholderSelector = `.${emptyNodeClass}::before`;

	return {
		editor: css`
			${placeholderSelector} {
				content: attr(data-placeholder);
				color: var(--ant-color-text-placeholder);
				float: left;
				height: 0;
				pointer-events: none;
			}
		`
	};
});

