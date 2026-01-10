import React from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { required } from "@task-manager/ant-validation";
import { updateProfile } from "@task-manager/api";
import { App, Button, Form, Input } from "antd";


interface UserInfoFormProps {
	username: string;
}

const requiredRule = required();

const UserInfoForm: React.FC<UserInfoFormProps> = props => {
	const queryClient = useQueryClient();

	const message = App.useApp().message;

	const { mutateAsync } = useMutation({
		mutationFn: updateProfile,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
		onError: error => message.error(error.message ?? "Failed to update profile")
	});

	return (
		<Form layout="vertical" initialValues={props} onFinish={mutateAsync}>
			<Form.Item label="Username" name="username" rules={requiredRule}>
				<Input placeholder="Enter your username" />
			</Form.Item>

			<Form.Item>
				<Button htmlType="submit" type="primary">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};

export default UserInfoForm;