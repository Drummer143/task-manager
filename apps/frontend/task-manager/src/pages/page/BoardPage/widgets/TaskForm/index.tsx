import React from "react";

import { Alert, Button, DatePicker, Drawer, Form, Input, Select, Space } from "antd";

import { TaskFormProps } from "./types";
import { initialValues, requiredRule, statusSelectOptions } from "./utils";

import { today } from "../../../../../shared/constants";
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
}) => {
	return (
		<Drawer
			width="40%"
			open={open}
			loading={formLoading}
			onClose={onClose}
			keyboard
			destroyOnClose={type === "update"}
			drawerRender={node =>
				!formLoading && !pageError ? (
					<Form
						className="h-full"
						initialValues={propsInitialValues ?? initialValues}
						onFinish={onSubmit}
						form={form}
						layout="vertical"
					>
						{node}
					</Form>
				) : (
					node
				)
			}
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
								message={submitError === true ? "Failed to submit task" : submitError}
								type="error"
							/>
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

					<Form.Item label="Description" name="description">
						<MDEditor editing minHeight="200px" />
					</Form.Item>
				</>
			)}
		</Drawer>
	);
};

export default TaskForm;
