import { memo } from "react";

import { Button, DatePicker, Drawer, Form, FormInstance, FormProps, Input, Select, Space } from "antd";
import { DefaultOptionType } from "antd/es/select";

import { statusArray, taskStatusLocale, today } from "shared/utils";
import { required } from "shared/validation";

interface TaskFormProps<T> {
	open?: boolean;
	form?: FormInstance<T>;
	okText?: string | false;
	loading?: boolean;
	cancelText?: string | false;
	initialValues?: Partial<T>;

	onClose?: () => void;
	onCancel?: () => void;
	onFinish?: FormProps<T>["onFinish"];
	onFieldsChange?: FormProps<T>["onFieldsChange"];
}

export const requiredRule = required();

export const statusSelectOptions: DefaultOptionType[] = statusArray.map(status => ({
	label: taskStatusLocale[status],
	value: status
}));

const TaskForm = <T,>({
	initialValues,
	onCancel,
	onClose,
	onFinish,
	open,
	form,
	loading,
	onFieldsChange,
	cancelText = "Cancel",
	okText = "Create"
}: TaskFormProps<T>) => {
	return (
		<Drawer
			open={open}
			loading={loading}
			onClose={onClose}
			keyboard
			drawerRender={node => (
				<Form
					onFieldsChange={onFieldsChange}
					className="h-full"
					initialValues={initialValues}
					onFinish={onFinish}
					form={form}
					layout="vertical"
				>
					{node}
				</Form>
			)}
			extra={
				(okText || cancelText) && (
					<Space>
						{cancelText && (
							<Button htmlType="reset" onClick={onCancel}>
								{cancelText}
							</Button>
						)}

						{okText && (
							<Button htmlType="submit" type="primary">
								{okText}
							</Button>
						)}
					</Space>
				)
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
	);
};

export default memo(TaskForm) as typeof TaskForm;
