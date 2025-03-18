import { Button as AntButton } from "antd";
import styled from "styled-components";

export const Button = styled(AntButton).attrs({
	block: false
})`
	width: 30vw;
	min-width: 200px;
	height: fit-content;

	padding: var(--ant-padding);
	padding-left: var(--ant-padding-xl);
`;
