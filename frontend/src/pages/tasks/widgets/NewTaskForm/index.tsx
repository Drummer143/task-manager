import React, { useCallback } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Button, DatePicker, Drawer, Form, Input, Select, Space } from "antd";

import { useDisclosure } from "shared/hooks";
import { today } from "shared/utils";
import { useWebsocketStore } from "store/websocketStore";

import { FormValues } from "./types";
import { initialValues, requiredRule, statusSelectOptions } from "./utils";

const NewTaskForm: React.FC = () => {
	const { onClose, onOpen, open } = useDisclosure();

	const [form] = Form.useForm<FormValues>();

	const { send } = useWebsocketStore();

	const handleSubmit = useCallback(
		(values: FormValues) => {
			send({
				type: "create-task",
				body: {
					...values,
					dueDate: values.dueDate?.toISOString()
				}
			});

			onClose();
		},
		[onClose, send]
	);

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	return (
		<>
			<Button icon={<PlusOutlined />} type="primary" onClick={onOpen}>
				New Task
			</Button>

			<Drawer
				open={open}
				onClose={handleCancel}
				keyboard
				drawerRender={node => (
					<Form
						className="h-full"
						initialValues={initialValues}
						onFinish={handleSubmit}
						form={form}
						layout="vertical"
					>
						{node}
					</Form>
				)}
				extra={
					<Space>
						<Button htmlType="reset" onClick={handleCancel}>
							Cancel
						</Button>
						<Button htmlType="submit" type="primary">
							Create
						</Button>
					</Space>
				}
			>
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
			</Drawer>
		</>
	);
};

export default NewTaskForm;
