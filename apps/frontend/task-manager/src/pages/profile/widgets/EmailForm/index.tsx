import React, { useMemo } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { composeRules, email, required } from "@task-manager/ant-validation";
import { changeEmail } from "@task-manager/api";
import { App, Button, Form, Input } from "antd";

interface EmailFormProps {
	email: string;
}

const requiredRule = composeRules(required(), email());

const EmailForm: React.FC<EmailFormProps> = ({ email }) => {
	const queryClient = useQueryClient();

	const initialValues = useMemo(() => ({ email }), [email]);

	const message = App.useApp().message;

	const { mutateAsync } = useMutation({
		mutationFn: changeEmail,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
		onError: error => message.error(error.message ?? "Failed to change email")
	});

	return (
		<Form
			layout="vertical"
			initialValues={initialValues}
			onFinish={mutateAsync}
			className="w-full"
		>
			<Form.Item label="Email" name="email" rules={requiredRule}>
				<Input placeholder="Enter your email" />
			</Form.Item>
			<Form.Item>
				<Button htmlType="submit" type="primary">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};

export default EmailForm;
