import { TaskStatus } from "@task-manager/api";
import { createStyles } from "antd-style";

import { statusColors } from "../../../../../shared/constants";

export const useStyles = createStyles(({ css }, { status }: { status: TaskStatus }) => ({
	taskWrapper: css`
		padding: var(--ant-padding-xxs) var(--ant-padding-xs);

		cursor: pointer;
		border-radius: var(--inner-border-radius);
		background-color: var(${statusColors[status]});
	`
}));