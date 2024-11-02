import { statusColors, updateOpacity } from "shared/utils";
import styled from "styled-components";

export const StyledTaskColumn = styled.div<{ status: TaskStatus; outlineColor?: string }>`
    min-width: 15rem;

    background-color: ${({ status }) => updateOpacity(statusColors[status], 0.3)};
    outline: ${({ outlineColor }) => outlineColor ? '2px solid ' + outlineColor : 'none'};
`
