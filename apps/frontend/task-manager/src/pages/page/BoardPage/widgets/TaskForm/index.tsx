import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getBoardStatuses, getUserList, User } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";
import { Alert, Button, DatePicker, Form, FormProps, Input, Select, Space } from "antd";
import { DefaultOptionType } from "antd/es/select";

import { FormValues, TaskFormProps } from "./types";
import { requiredRule } from "./utils";

import { useAuthStore } from "../../../../../app/store/auth";
import { today } from "../../../../../shared/constants";
import FullSizeLoader from "../../../../../shared/ui/FullSizeLoader";
import Drawer from "../../../../../widgets/Drawer";
import SelectWithInfiniteScroll from "../../../../../widgets/SelectWithInfiniteScroll";

const MDEditor = lazySuspense(() => import("../../../../../widgets/MDEditor"), <FullSizeLoader />);

const TaskForm: React.FC<TaskFormProps> = ({
	onClose,
	type,
	open,
	onCancel,
	form,
	isSubmitting,
	onSubmit,
	formLoading,
	pageError,
	initialValues: propsInitialValues,
	submitError,
	extraHeader,
	pageId
}) => {
	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const { data: statuses, isLoading: statusesLoading } = useQuery({
		queryKey: ["statuses", pageId],
		enabled: open,
		queryFn: () => getBoardStatuses({ pathParams: { pageId } })
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

	const formProps = useMemo<FormProps<FormValues>>(
		() => ({
			className: "h-full",
			initialValues: propsInitialValues,
			onFinish: onSubmit,
			form,
			layout: "horizontal",
			colon: false
		}),
		[propsInitialValues, onSubmit, form]
	);

	return (
		<Drawer
			width="40%"
			open={open}
			loading={formLoading}
			onClose={onClose}
			keyboard
			onOk={onSubmit}
			okLoading={isSubmitting}
			okText="Cancel"
			form={!formLoading && !pageError ? formProps : undefined}
			extra={
				!pageError && (
					<Space>
						{extraHeader}

						<Button disabled={isSubmitting} htmlType="reset" onClick={onCancel}>
							Cancel
						</Button>

						<Button loading={isSubmitting} htmlType="submit" type="primary">
							{type === "create" ? "Create" : "Update"}
						</Button>
					</Space>
				)
			}
		>
			{pageError ? (
				<Alert message={pageError} type="error" />
			) : (
				<>
					{submitError && (
						<Form.Item>
							<Alert
								message={
									submitError === true ? "Failed to submit task" : submitError
								}
								type="error"
							/>
						</Form.Item>
					)}

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
							enabled={open && !formLoading}
							filterQueryName="query"
							{...memoizedAssigneeSelectProps}
						/>
					</Form.Item>

					<Form.Item label="Due Date" name="dueDate">
						<DatePicker minDate={today} showTime className="w-full" />
					</Form.Item>

					<Form.Item layout="vertical" label="Description" name="description">
						<MDEditor editable />
					</Form.Item>
				</>
			)}
		</Drawer>
	);
};

export default TaskForm;

