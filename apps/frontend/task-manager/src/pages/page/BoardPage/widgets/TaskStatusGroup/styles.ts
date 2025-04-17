import { TaskStatus } from "@task-manager/api";
import { createStyles } from "antd-style";

import { statusColors } from "../../../../../shared/constants";

export const useStyles = createStyles(
	({ css }, { isDragTarget, status }: { status: TaskStatus; isDragTarget: boolean }) => ({
		taskGroup: css`
			--inner-border-radius: calc(var(--ant-border-radius) - var(--ant-padding-xxs) / 2);

			min-width: 280px;

			padding: var(--ant-padding-xxs) var(--ant-padding-xxs) var(--ant-padding-xs);

			background-color: var(${statusColors[status]});
			${isDragTarget && "outline: 2px solid var(--ant-color-text-tertiary);"}
			border-radius: var(--ant-border-radius);
		`,
		taskGroupHeader: css`
			display: flex;
			gap: var(--ant-padding-xxs);

			margin-bottom: var(--ant-margin-sm);
		`,
		taskGroupTitle: css`
			flex: 1;

			padding: var(--ant-padding-xxs) var(--ant-padding-xs);

			background-color: var(--ant-color-task-group-title);
			border-radius: var(--inner-border-radius);
		`,
		addTaskButton: css`
			border-radius: calc(var(--ant-border-radius) - var(--ant-padding-xxs) / 2);
		`
	})
);
