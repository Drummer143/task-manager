import { MDXEditor } from "@mdxeditor/editor";
import styled, { css } from "styled-components";

export const Placeholder = styled.p`
	position: absolute;
	top: 0;
	left: 2px;

	opacity: 0.5;

	pointer-events: none;
`;

export const EditorScroll = styled.div<{ $horizontalPadding?: boolean }>`
	max-height: 100%;

	padding: 0.25rem ${({ $horizontalPadding }) => ($horizontalPadding ? "15%" : "0")};

	transition: padding 0.1s;
	overflow-y: auto;

	@media screen and (max-width: 1200px) {
		padding: 0.125rem 0;
	}
`;

export const Bg = styled.div<{ $editing?: boolean }>`
	display: block;

	min-height: 100%;

	padding: 0.5rem;

	border-radius: var(--ant-border-radius);
	transition:
		background-color 0.1s,
		border-color 0.1s;
	border: 1px solid transparent;
	${({ $editing }) =>
		$editing &&
		css`
			border-color: var(--ant-color-border);
			background-color: var(--ant-color-bg-container);
			cursor: text;
		`}
`;

export const MDEditor = styled(MDXEditor)<{ contentEditableClassName: string; $minHeight?: string }>`
	position: relative;

	${({ $minHeight }) => $minHeight && `min-height: ${$minHeight};`}

	.${({ contentEditableClassName }) => contentEditableClassName} {
		outline: none;
	}
`;
