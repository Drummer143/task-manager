import React from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { App, Button, Form, Input } from "antd";
import { updateProfile } from "api";

import { required } from "shared/validation";

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
