import React, { useMemo } from "react";

import { HistoryOutlined } from "@ant-design/icons";
import { getTaskHistory, TaskStatus } from "@task-manager/api";
import { useDisclosure } from "@task-manager/utils";
import { Button, Drawer, Tag, Typography } from "antd";

import { useAppStore } from "../../../../../app/store/app";
import { statusColors, taskStatusLocale } from "../../../../../shared/constants";
import MDEditor from "../../../../../widgets/MDEditor";
import VersionHistoryList, { VersionHistoryEntryRenders } from "../../../../../widgets/VersionHistoryList";

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

	return (
		<>
			<Button icon={<HistoryOutlined />} type="text" onClick={onOpen} />

			<Drawer open={open} onClose={onClose} title="Task history">
				<VersionHistoryList
					enabled={open}
					changeOrder={fieldsOrder}
					entryRenders={versionHistoryRenderers}
					fetchLog={query =>
						getTaskHistory({ ...props, workspaceId: useAppStore.getState().workspaceId!, ...query })
					}
				/>
			</Drawer>
		</>
	);
};

export default TaskHistory;
