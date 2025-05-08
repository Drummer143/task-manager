import { createStyles } from "antd-style";

export const useStyles = createStyles(
	({ css }, { emptyNodeClass }: { emptyNodeClass: string } = { emptyNodeClass: "is-empty" }) => {
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
	}
);

