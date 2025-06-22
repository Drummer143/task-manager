import { TaskStatus } from "@task-manager/api";
import { createStyles } from "antd-style";

import { statusColors } from "../../../../../shared/constants";

export const useStyles = createStyles(
	({ css }, { status, isDragging }: { status: TaskStatus; isDragging: boolean }) => ({
		taskWrapper: css`
			padding: var(--ant-padding-xxs) var(--ant-padding-xs);

			cursor: pointer;
			border-radius: var(--inner-border-radius);
			background-color: var(${statusColors[status]});
			${isDragging && "opacity: 0.4;"}
			transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-in-out);
		`
	})
);

