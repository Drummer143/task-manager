import React, { useCallback, useMemo } from "react";

import { HistoryOutlined } from "@ant-design/icons";
import { getTaskHistory, TaskStatus } from "@task-manager/api";
import { useDisclosure } from "@task-manager/react-utils";
import { Button, Drawer, Tag, Typography } from "antd";

import { useAuthStore } from "../../../../../app/store/auth";
import { statusColors, taskStatusLocale } from "../../../../../shared/constants";
import MDEditor from "../../../../../widgets/MDEditor";
import VersionHistoryList, { FetchLog, VersionHistoryEntryRenders } from "../../../../../widgets/VersionHistoryList";

interface TaskHistoryProps {
	taskId: string;
	pageId: string;
}

type ChangeKeys = keyof Awaited<ReturnType<typeof getTaskHistory>>["data"][number]["changes"];

const TaskHistory: React.FC<TaskHistoryProps> = props => {
	const { open, onOpen, onClose } = useDisclosure();

	const versionHistoryRenderers: VersionHistoryEntryRenders<ChangeKeys> = useMemo(
		() => ({
			status: (info: TaskStatus) => <Tag color={`var(${statusColors[info]})`}>{taskStatusLocale[info]}</Tag>,
			description: (info: string) =>
				info ? (
					<MDEditor value={info} editing={false} />
				) : (
					<Typography.Text type="secondary" italic>
						Empty description
					</Typography.Text>
				)
		}),
		[]
	);

	const fieldsOrder = useMemo<ChangeKeys[]>(() => ["title", "status", "assigneeId", "dueDate", "description"], []);

	const fetchLog = useCallback<FetchLog<ChangeKeys>>(
		query => getTaskHistory({ ...props, ...query, workspaceId: useAuthStore.getState().user.workspace.id }),
		[props]
	);

	return (
		<>
			<Button icon={<HistoryOutlined />} type="text" onClick={onOpen} />

			<Drawer open={open} onClose={onClose} title="Task history">
				<VersionHistoryList
					enabled={open}
					changeOrder={fieldsOrder}
					entryRenders={versionHistoryRenderers}
					fetchLog={fetchLog}
				/>
			</Drawer>
		</>
	);
};

export default TaskHistory;