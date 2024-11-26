import React, { useMemo } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input } from "antd";
import api from "api";

import { composeRules, email, required } from "shared/validation";

interface EmailFormProps {
	email: string;
}

const requiredRule = composeRules(required(), email());

const EmailForm: React.FC<EmailFormProps> = ({ email }) => {
	const queryClient = useQueryClient();

	const initialValues = useMemo(() => ({ email }), [email]);

	const { mutateAsync } = useMutation({
		mutationFn: api.profile.changeEmail,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
		}
	});

	return (
		<Form layout="vertical" initialValues={initialValues} onFinish={mutateAsync} className="w-full">
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