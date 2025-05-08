import React from "react";

import { Alert, Button, DatePicker, Form, Input, Select, Space } from "antd";

import { TaskFormProps } from "./types";
import { initialValues, requiredRule, statusSelectOptions } from "./utils";

import { today } from "../../../../../shared/constants";
import Drawer from "../../../../../widgets/Drawer";
import MDEditor from "../../../../../widgets/MDEditor";

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
	extraHeader
}) => (
	<Drawer
		width="40%"
		open={open}
		loading={formLoading}
		onClose={onClose}
		keyboard
		onOk={onSubmit}
		okLoading={isSubmitting}
		okText="Cancel"
		form={
			!formLoading && !pageError
				? {
						className: "h-full",
						initialValues: propsInitialValues ?? initialValues,
						onFinish: onSubmit,
						form,
						layout: "horizontal",
						colon: false
					}
				: undefined
		}
		destroyOnClose={type === "edit"}
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
						<Alert message={submitError === true ? "Failed to submit task" : submitError} type="error" />
					</Form.Item>
				)}

				<Form.Item label="Title" name="title" rules={requiredRule}>
					<Input placeholder="Enter task title" />
				</Form.Item>

				<Form.Item label="Status" name="status" rules={requiredRule}>
					<Select placeholder="Select task status" options={statusSelectOptions} />
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

export default TaskForm;