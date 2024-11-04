import { Divider as AntDivider, Layout } from "antd";
import styled from "styled-components";

export const Header = styled(Layout.Header)`
    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 var(--ant-padding);
`

export const Divider = styled(AntDivider)`
	margin: 0;
`
