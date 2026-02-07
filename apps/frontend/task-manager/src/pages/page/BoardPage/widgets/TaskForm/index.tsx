import React, { useCallback, useMemo } from "react";

import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import {
	createUploadToken,
	getBoardStatuses,
	getTask,
	getUserList,
	updateTask,
	User
} from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";
import { App, Button, DatePicker, Flex, Form, FormProps, Input, Select, Space } from "antd";
import { DefaultOptionType } from "antd/es/select";
import dayjs from "dayjs";
import { useNavigate, useParams, useSearchParams } from "react-router";

import { FormValues } from "./types";
import { requiredRule } from "./utils";

import { useAuthStore } from "../../../../../app/store/auth";
import { today } from "../../../../../shared/constants";
import FullSizeLoader from "../../../../../shared/ui/FullSizeLoader";
import Drawer from "../../../../../widgets/Drawer";
import SelectWithInfiniteScroll from "../../../../../widgets/SelectWithInfiniteScroll";
import TaskChat from "../TaskChat";

const MDEditor = lazySuspense(() => import("../../../../../widgets/MDEditor"), <FullSizeLoader />);

const TaskForm: React.FC = () => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const pageId = useParams<{ id: string }>().id!;

	const taskId = useSearchParams()[0].get("taskId");

	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const message = App.useApp().message;

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const [
		{ data: taskInitialValues, isLoading: taskLoading },
		{ data: statuses, isLoading: statusesLoading }
	] = useQueries({
		queries: [
			{
				queryKey: [taskId],
				enabled: !!taskId,
				queryFn: async (): Promise<FormValues> => {
					const result = await getTask({
						pathParams: {
							taskId: taskId!,
							include: ["assignee"]
						}
					});

					return {
						statusId: result.status.id,
						title: result.title,
						description: result.description,
						assigneeId: result.assignee?.id,
						dueDate: result.dueDate ? dayjs(result.dueDate) : undefined
					};
				}
			},
			{
				queryKey: ["statuses", pageId],
				enabled: !!taskId,
				queryFn: () => getBoardStatuses({ pathParams: { pageId } })
			}
		]
	});

	const { mutateAsync: handleSubmit, isPending: isSubmitPending } = useMutation({
		mutationFn: (values: FormValues) =>
			updateTask({
				pathParams: {
					taskId: taskId!
				},
				body: {
					...values,
					dueDate: values.dueDate?.toISOString()
				}
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [pageId] });
			navigate(`/pages/${pageId}`);
		},
		onError: error => message.error(error.message ?? "Failed to update task")
	});

	const handleClose = useCallback(() => navigate(`/pages/${pageId}`), [pageId, navigate]);

	const formProps = useMemo<FormProps<FormValues>>(
		() => ({
			className: "h-full",
			initialValues: taskInitialValues,
			onFinish: handleSubmit,
			layout: "horizontal",
			colon: false
		}),
		[taskInitialValues, handleSubmit]
	);

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
		async (file: File, assetId: string, taskId: string) =>
			createUploadToken({
				body: {
					assetId,
					name: file.name,
					target: {
						type: "taskDescription",
						id: taskId
					}
				}
			}).then(res => res.token),
		[]
	);

	return (
		<Drawer
			width="40%"
			open={!!taskId}
			loading={taskLoading}
			onClose={handleClose}
			keyboard
			onOk={handleSubmit}
			okLoading={isSubmitPending}
			okText="Save"
			form={!taskLoading ? formProps : undefined}
			extra={
				<Space>
					<Flex gap="var(--ant-margin-xxs)">
						<TaskChat />

						{/* <TaskHistory taskId={taskId!} pageId={pageId} /> */}
					</Flex>

					<Button disabled={isSubmitPending} htmlType="reset" onClick={handleClose}>
						Cancel
					</Button>

					<Button loading={isSubmitPending} htmlType="submit" type="primary">
						Save
					</Button>
				</Space>
			}
		>
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
					fetchItems={getUserList}
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
				<Form.Item layout="vertical" label="Description" name="description">
					<MDEditor
						editable
						getFileUploadToken={(file, assetId) =>
							getFileUploadToken(file, assetId, taskId)
						}
					/>
				</Form.Item>
			)}
		</Drawer>
	);
};

export default TaskForm;

