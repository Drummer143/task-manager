import { createStyles } from "antd-style";

interface UseStylesParams {
	emptyNodeClass: string;
}

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

