import React, { useCallback, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { required } from "@task-manager/ant-validation";
import { createUploadToken, getBoardStatuses, getUsersList } from "@task-manager/api/main";
import { User } from "@task-manager/api/main/schemas";
import { lazySuspense } from "@task-manager/react-utils";
import { DatePicker, Form, Input, Select } from "antd";
import { DefaultOptionType } from "antd/es/select";

import { today } from "../../shared/constants";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";
import SelectWithInfiniteScroll from "../SelectWithInfiniteScroll";

export const requiredRule = required();

const MDEditor = lazySuspense(() => import("../MDEditor"), <FullSizeLoader />);

export interface TaskFormProps {
	pageId: string;
	taskId: string;
	workspaceId: string;
	taskLoading: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ taskLoading, taskId, pageId, workspaceId }) => {
	const { data: statuses, isLoading: statusesLoading } = useQuery({
		queryKey: ["statuses", pageId],
		enabled: !!taskId,
		queryFn: () => getBoardStatuses(pageId)
	});

	const statusSelectOptions = useMemo(
		() =>
			statuses?.map(status => ({
				value: status.id,
				label: status.title,
				title: status.title
			})) || [],
		[statuses]
	);

	const memoizedAssigneeSelectProps = useMemo(
		() => ({
			queryKey: ["users", workspaceId],
			extraQueryParams: { workspaceId },
			transformItem: (user: User): DefaultOptionType => ({
				value: user.id,
				label: user.username,
				title: user.username
			})
		}),
		[workspaceId]
	);

	const getFileUploadToken = useCallback(
		async (file: File, assetId: string) =>
			createUploadToken({
				assetId,
				name: file.name,
				target: {
					type: "taskDescription",
					id: taskId
				}
			}).then(res => res.token),
		[taskId]
	);

	return (
		<>
			<Form.Item label="Title" name="title" rules={requiredRule}>
				<Input placeholder="Enter task title" />
			</Form.Item>

			<Form.Item label="Status" name="statusId" rules={requiredRule}>
				<Select
					placeholder="Select task status"
					loading={statusesLoading}
					options={statusSelectOptions}
				/>
			</Form.Item>

			<Form.Item label="Assignee" name="assigneeId">
				<SelectWithInfiniteScroll
					placeholder="Select task assignee"
					fetchItems={getUsersList}
					allowClear
					enabled={!!taskId && !taskLoading}
					filterQueryName="query"
					{...memoizedAssigneeSelectProps}
				/>
			</Form.Item>

			<Form.Item label="Due Date" name="dueDate">
				<DatePicker minDate={today} showTime className="w-full" />
			</Form.Item>

			{taskId && (
				<Form.Item layout="vertical" label="Description" name="description" noStyle>
					<MDEditor
						editable
						getFileUploadToken={(file, assetId) => getFileUploadToken(file, assetId)}
					/>
				</Form.Item>
			)}
		</>
	);
};

export default TaskForm;

