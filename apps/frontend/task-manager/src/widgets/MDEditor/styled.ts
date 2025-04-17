import { createStyles } from "antd-style";

interface UseStylesProps {
	contentEditableClassName: string;
	editing?: boolean;
	horizontalPadding?: boolean;
	minHeight?: string;
}

export const useStyles = createStyles(
	({ css, responsive }, { contentEditableClassName, editing, horizontalPadding, minHeight }: UseStylesProps) => ({
		placeholder: css`
			position: absolute;
			top: 0;
			left: 2px;

			opacity: 0.5;

			pointer-events: none;
		`,
		editorScroll: css`
			max-height: 100%;

			padding: 0.25rem ${horizontalPadding ? "15%" : "0"};

			transition: padding 0.1s;
			overflow-y: auto;

			${responsive.lg} {
				padding: 0.125rem 0;
			}
		`,
		bg: css`
			display: block;

			min-height: 100%;

			padding: 0.5rem;

			border-radius: var(--ant-border-radius);
			transition:
				background-color 0.1s,
				border-color 0.1s;
			border: 1px solid transparent;
			${editing &&
			css`
				border-color: var(--ant-color-border);
				background-color: var(--ant-color-bg-container);
				cursor: text;
			`}
		`,
		editor: css`
			position: relative;

			${minHeight && `min-height: ${minHeight};`}

			.${contentEditableClassName} {
				outline: none;
			}
		`
	})
);