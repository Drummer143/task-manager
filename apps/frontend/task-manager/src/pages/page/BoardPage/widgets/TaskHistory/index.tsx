import React, { useMemo } from "react";

import { HistoryOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getTaskHistory } from "@task-manager/api";
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
