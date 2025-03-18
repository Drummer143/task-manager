import React, { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { App, Form, Input, Typography } from "antd";
import { resetPassword } from "api";
import { Link } from "react-router-dom";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import AuthPageMessageWrapper from "shared/ui/AuthPageMessageWrapper";
import { parseUseQueryError } from "shared/utils/errors";
import { composeRules, email, required } from "shared/validation";
import AuthForm from "widgets/AuthForm";

const emailRule = composeRules(required(), email());

const ResetPassword: React.FC = () => {
	const message = App.useApp().message;

	const { mutateAsync, isSuccess, isPending, error, reset } = useMutation({
		mutationFn: resetPassword,
		onError: error => message.error(error.message ?? "Failed to reset password")
	});

	const parsedError = useMemo(() => parseUseQueryError(error, undefined, [400, 404]), [error]);

	if (isSuccess) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>Password reset email sent</Typography.Title>

				<Typography.Paragraph>
					We have sent you an email with a link to reset your password. Please check your inbox.
				</Typography.Paragraph>

				<Link to="/login">Back to login</Link>
			</AuthPageMessageWrapper>
		);
	}

	return (
		<AuthForm
			submitText="Send reset password mail"
			headingText="Reset password"
			onFinish={mutateAsync}
			error={parsedError}
			submitLoading={isPending}
			onValuesChange={reset}
			bottomLink={<Link to="/login">Back to login</Link>}
		>
			<Form.Item name="email" label="Email" rules={emailRule}>
				<Input placeholder="email@example.com" type="email" autoComplete="email" name="email" />
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(ResetPassword, false);
