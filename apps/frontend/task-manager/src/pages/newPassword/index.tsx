import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";
import {
	// updatePassword as apiUpdatePassword,
	// verifyResetPasswordToken as apiVerifyResetPasswordToken,
	parseApiError
} from "@task-manager/api";
import { Flex, Form, Input, Spin, Typography } from "antd";
import { Rule } from "antd/es/form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";

import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import AuthPageMessageWrapper from "../../shared/ui/AuthPageMessageWrapper";
import { confirmPassword, password } from "../../shared/validation";
import AuthForm from "../../widgets/AuthForm";

const rules: Record<string, Rule[]> = {
	password: password(),
	confirmPassword: confirmPassword()
};

const NewPassword: React.FC = () => {
	const token = useSearchParams()[0].get("token");

	const navigate = useNavigate();

	const [passwordsVisible, setPasswordsVisible] = useState(false);

	const t = useTranslation("new_password_page")[0];

	const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const {
		mutateAsync: verifyResetPasswordToken,
		isSuccess: isTokenValidated,
		isPending: isTokenValidating
	} = useMutation({
		mutationFn: (token: string) => Promise.resolve()
	});

	const {
		mutateAsync: updatePassword,
		isSuccess: isPasswordUpdated,
		isPending: isPasswordUpdating,
		error
	} = useMutation({
		mutationFn: ({ password, token }: { password: string; token: string }) => Promise.resolve()
	});

	const passwordUpdateError = useMemo(() => parseApiError(error, undefined, [400, 404]), [error]);

	const handleSubmit = useCallback(
		async (values: { password: string; confirmPassword: string }) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
	}, [token, verifyResetPasswordToken]);

	if (isTokenValidating) {
		return (
			<Flex justify="center" vertical align="center" className="h-full w-full">
				<Typography.Title level={3}>{t("loading_title")}</Typography.Title>

				<Spin size="large" />
			</Flex>
		);
	}

	if (!token || !isTokenValidated) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>{t("invalid_title")}</Typography.Title>

				<Typography.Paragraph>{t("invalid_description")}</Typography.Paragraph>

				<Typography.Paragraph>
					<Link to="/login">{t("back_to_login")}</Link>
				</Typography.Paragraph>
			</AuthPageMessageWrapper>
		);
	}

	if (isPasswordUpdated) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>{t("password_updated_title")}</Typography.Title>

				<Typography.Paragraph>{t("password_updated_description")}</Typography.Paragraph>

				<Typography.Paragraph>
					<Link to="/login">{t("back_to_login")}</Link>
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
					visibilityToggle={{
						onVisibleChange: setPasswordsVisible,
						visible: passwordsVisible
					}}
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
					visibilityToggle={{
						onVisibleChange: setPasswordsVisible,
						visible: passwordsVisible
					}}
					autoComplete="new-password"
					name="confirm_password"
					id="confirm_password"
				/>
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(NewPassword, false);

