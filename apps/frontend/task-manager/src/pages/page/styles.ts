import styled from "styled-components";

export const PageContainer = styled.div`
	height: 100%;
	max-height: 100%;

	display: grid;
	grid-template-rows: min-content 1fr;

	padding: var(--ant-padding);

	overflow: hidden;
`;
