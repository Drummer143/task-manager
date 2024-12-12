import { Alert as AntAlert, Typography } from "antd";
import styled from "styled-components";

import SelectWithInfiniteScroll from "widgets/SelectWithInfiniteScroll";

export const Alert = styled(AntAlert)`
	margin-top: var(--ant-margin-xl);
`;

export const Header = styled(Typography.Title)`
	margin-bottom: var(--ant-margin-xs);
	padding-bottom: var(--ant-padding-xxs);

	border-bottom: 1px solid var(--ant-color-split);
`;

export const Body = styled.div`
	padding: var(--ant-padding-sm);

	background-color: var(--ant-color-bg-container);
	border-radius: var(--ant-border-radius);
`;

export const AddMemberButtonContainer = styled.div`
	display: flex;
	justify-content: flex-end;

	margin-top: var(--ant-margin-md);
`;

export const UserSelect = styled(SelectWithInfiniteScroll)`
	width: 15.5rem;
` as typeof SelectWithInfiniteScroll;
