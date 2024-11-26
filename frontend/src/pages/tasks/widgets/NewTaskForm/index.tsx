import React, { useCallback } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Form } from "antd";

import { useDisclosure } from "shared/hooks";
import { useWebsocketStore } from "store/websocketStore";

import TaskForm from "../TaskForm";
import { FormValues } from "../TaskForm/types";

const initialValues: Partial<FormValues> = {
	status: "not_done"
};

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

			<TaskForm
				open={open}
				form={form}
				initialValues={initialValues}
				onClose={onClose}
				onCancel={handleCancel}
				onFinish={handleSubmit}
			/>
		</>
	);
};

export default NewTaskForm;
