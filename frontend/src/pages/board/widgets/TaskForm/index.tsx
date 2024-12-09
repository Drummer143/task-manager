import React from "react";

import { Alert, Button, DatePicker, Drawer, Form, Input, Select, Space } from "antd";

import { today } from "shared/utils";

import { TaskFormProps } from "./types";
import { initialValues, requiredRule, statusSelectOptions } from "./utils";

const TaskForm: React.FC<TaskFormProps> = ({
	onClose,
	open,
	onCancel,
	form,
	isSubmitting,
	onSubmit,
	formLoading,
	pageError,
	initialValues: propsInitialValues
}) => {
	return (
		<Drawer
			open={open}
			loading={formLoading}
			onClose={onClose}
			keyboard
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
						<Button disabled={isSubmitting} htmlType="reset" onClick={onCancel}>
							Cancel
						</Button>

						<Button loading={isSubmitting} htmlType="submit" type="primary">
							Create
						</Button>
					</Space>
				)
			}
		>
			{pageError ? (
				<Alert message={pageError} type="error" />
			) : (
				<>
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
						<Input.TextArea placeholder="Enter task description" />
					</Form.Item>
				</>
			)}
		</Drawer>
	);
};

export default TaskForm;
