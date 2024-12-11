import styled from "styled-components";

import { statusColors } from "shared/utils";

export const StyledTaskColumn = styled.div<{ status: TaskStatus; outlineColor?: string }>`
	min-width: 15rem;

	background-color: ${({ status }) => statusColors[status]};
	outline: ${({ outlineColor }) => (outlineColor ? "2px solid " + outlineColor : "none")};
`;
