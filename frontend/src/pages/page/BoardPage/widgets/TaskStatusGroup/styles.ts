import { Button, Typography } from "antd";
import styled from "styled-components";

import { statusColors } from "shared/utils";

export const TaskGroup = styled.div<{ status: TaskStatus; isDragTarget: boolean }>`
	--inner-border-radius: calc(var(--ant-border-radius) - var(--ant-padding-xxs) / 2);

	min-width: 280px;

	padding: var(--ant-padding-xxs) var(--ant-padding-xxs) var(--ant-padding-xs);

	background-color: ${({ status }) => `var(${statusColors[status]})`};
	${({ isDragTarget }) => isDragTarget && "outline: 2px solid var(--ant-color-text-tertiary);"}
	border-radius: var(--ant-border-radius);
`;

export const TaskGroupHeader = styled.div`
	display: flex;
	gap: var(--ant-padding-xxs);

	margin-bottom: var(--ant-margin-sm);
`;

export const TaskGroupTitle = styled(Typography.Text)`
	flex: 1;

	padding: var(--ant-padding-xxs) var(--ant-padding-xs);

	background-color: var(--ant-color-task-group-title);
	border-radius: var(--inner-border-radius);
`;

export const AddTaskButton = styled(Button)`
	border-radius: calc(var(--ant-border-radius) - var(--ant-padding-xxs) / 2);
`;
