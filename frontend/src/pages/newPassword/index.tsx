import React, { useCallback, useEffect, useMemo, useRef } from "react";

import { useMutation } from "@tanstack/react-query";
import { Flex, Form, Input, Spin, Typography } from "antd";
import { Rule } from "antd/es/form";
import { updatePassword as apiUpdatePassword, verifyResetPasswordToken as apiVerifyResetPasswordToken } from "api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import AuthPageMessageWrapper from "shared/ui/AuthPageMessageWrapper";
import { parseUseQueryError } from "shared/utils/errors";
import { confirmPassword, password } from "shared/validation";
import AuthForm from "widgets/AuthForm";

const rules: Record<string, Rule[]> = {
	password: password(),
	confirmPassword: confirmPassword()
};

const NewPassword: React.FC = () => {
	const token = useSearchParams()[0].get("token");

	const navigate = useNavigate();

	const [passwordsVisible, setPasswordsVisible] = React.useState(false);

	const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const {
		mutateAsync: verifyResetPasswordToken,
		isSuccess: isTokenValidated,
		isPending: isTokenValidating
	} = useMutation({
		mutationFn: apiVerifyResetPasswordToken
	});

	const {
		mutateAsync: updatePassword,
		isSuccess: isPasswordUpdated,
		isPending: isPasswordUpdating,
		error
	} = useMutation({
		mutationFn: apiUpdatePassword
	});

	const passwordUpdateError = useMemo(() => parseUseQueryError(error, undefined, [400, 404]), [error]);

	const visibilityToggle = useMemo(
		() => ({ onVisibleChange: setPasswordsVisible, visible: passwordsVisible }),
		[passwordsVisible]
	);

	const handleSubmit = useCallback(
		async (values: { password: string; confirmPassword: string }) => {
			await updatePassword({ password: values.password, token: token! });

			redirectTimeoutRef.current = setTimeout(() => {
				navigate("/login", { replace: true });
			}, 5000);
		},
		[navigate, token, updatePassword]
	);

	useEffect(() => {
		if (!token) {
			return;
		}

		verifyResetPasswordToken(token);

		return () => {
			if (redirectTimeoutRef.current) {
				clearTimeout(redirectTimeoutRef.current);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isTokenValidating) {
		return (
			<Flex justify="center" vertical align="center" className="h-full w-full">
				<Typography.Title level={3}>Verifying password reset token</Typography.Title>

				<Spin size="large" />
			</Flex>
		);
	}

	if (!token || !isTokenValidated) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>Invalid token</Typography.Title>

				<Typography.Paragraph>
					Invalid password reset token. Please check the email and try again. If issue persists, please
					request a new password reset email or contact support.
				</Typography.Paragraph>

				<Typography.Paragraph>
					<Link to="/login">Back to login</Link>
				</Typography.Paragraph>
			</AuthPageMessageWrapper>
		);
	}

	if (isPasswordUpdated) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>Password updated</Typography.Title>

				<Typography.Paragraph>
					Your password has been updated. You will be redirected to login page in 5 seconds.
				</Typography.Paragraph>

				<Typography.Paragraph>
					<Link to="/login">Back to login</Link>
				</Typography.Paragraph>
			</AuthPageMessageWrapper>
		);
	}

	return (
		<AuthForm
			headingText="New password"
			submitText="Update password"
			onFinish={handleSubmit}
			bottomLink={<Link to="/login">Back to login</Link>}
			error={passwordUpdateError}
			submitLoading={isPasswordUpdating}
		>
			<Form.Item name="password" label="Password" rules={rules.password}>
				<Input.Password
					placeholder="********"
					visibilityToggle={visibilityToggle}
					autoComplete="new-password"
					name="password"
					id="password"
				/>
			</Form.Item>

			<Form.Item
				name="confirmPassword"
				label="Confirm Password"
				rules={rules.confirmPassword}
				dependencies={["password"]}
			>
				<Input.Password
					placeholder="********"
					visibilityToggle={visibilityToggle}
					autoComplete="new-password"
					name="confirm_password"
					id="confirm_password"
				/>
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(NewPassword, false);
