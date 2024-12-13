import styled, { css } from "styled-components";

export const LoadingMoreWrapper = styled.div`
	width: 100%;

	display: flex;
	justify-content: center;
	align-items: center;

	padding: var(--ant-padding-xs);
`;

export const ItemWrapper = styled.div<{ selected: boolean }>`
	transition: background var(--ant-motion-duration-slow) ease;

	padding: var(--ant-padding-xxs) var(--ant-padding-xs);
	border-radius: var(--ant-border-radius);
	cursor: pointer;

	${({ selected }) =>
		selected
			? css`
					background-color: var(--ant-select-option-selected-bg);
				`
			: css`
					&:hover {
						background-color: var(--ant-select-option-active-bg);
					}
				`}
`;
