import React, { useMemo } from "react";

import { HistoryOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Drawer, Tag, Typography } from "antd";
import { getTaskHistory } from "api";

import { useDisclosure } from "shared/hooks";
import { statusColors, taskStatusLocale } from "shared/utils";
import { useAppStore } from "store/app";
import MDEditor from "widgets/MDEditor";
import VersionHistoryList, { VersionHistoryEntryRenders } from "widgets/VersionHistoryList";

interface TaskHistoryProps {
	taskId: string;
	pageId: string;
}

const TaskHistory: React.FC<TaskHistoryProps> = props => {
	const { open, onOpen, onClose } = useDisclosure();


	const { data, isLoading } = useQuery({
		queryKey: ["task-history", props.taskId],
		queryFn: () => getTaskHistory({ ...props, workspaceId: useAppStore.getState().workspaceId! }),
		enabled: open
	});

	const versionHistoryRenderers: VersionHistoryEntryRenders<
		keyof NonNullable<typeof data>["history"][number]["changes"]
	> = useMemo(
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

	const fieldsOrder = useMemo<(keyof NonNullable<typeof data>["history"][number]["changes"])[]>(
		() => ["title", "status", "assigneeId", "dueDate", "description"],
		[]
	);

	return (
		<>
			<Button icon={<HistoryOutlined />} type="text" onClick={onOpen} />

			<Drawer open={open} onClose={onClose} title="Task history" loading={isLoading}>
				<VersionHistoryList
					changeOrder={fieldsOrder}
					versionList={data?.history}
					entryRenders={versionHistoryRenderers}
				/>
			</Drawer>
		</>
	);
};

export default TaskHistory;
