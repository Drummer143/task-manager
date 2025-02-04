import { Layout } from "antd";
import styled from "styled-components";

export const Header = styled(Layout.Header)`
	display: flex;
	justify-content: space-between;
	align-items: center;

	padding: 0 var(--ant-padding);

	border-bottom: var(--ant-line-width) solid var(--ant-color-split);
`;

export const Content = styled(Layout.Content)`
	max-height: 100%;

	border-left: var(--ant-line-width) solid var(--ant-color-split);

	overflow: hidden;
`;
