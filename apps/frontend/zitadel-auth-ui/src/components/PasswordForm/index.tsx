"use client";

import React, { useState } from "react";

import { removeEmptyFields } from "@task-manager/utils/object";
import { Alert, Button } from "antd";
import FormItem from "antd/es/form/FormItem";
import PasswordInput from "antd/es/input/Password";
import { useRouter } from "next/navigation";

import { required } from "@task-manager/antd-vatidation";
import { Session } from "@task-manager/zitadel-api/zitadel/session/v2/session_pb";
import { ChecksSchema } from "@task-manager/zitadel-api/zitadel/session/v2/session_service_pb";
import { LoginSettings } from "@task-manager/zitadel-api/zitadel/settings/v2/login_settings_pb";
import { create } from "@task-manager/zitadel-client";

import { resetPassword, sendPassword } from "../../shared/lib/server/password";
import FormLayout from "../FormLayout";
import UserSessionInfo from "../UserSessionInfo";

interface PasswordFormProps {
	loginName: string;

	requestId?: string;
	sessionId?: string;
	organization?: string;
	sessionFactor?: Session;
	isAlternative?: boolean;
	loginSettings?: LoginSettings;
}

const passwordRule = required();

interface FormValues {
	password: string;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
	sessionFactor,
	loginName,
	sessionId,
	organization,
	requestId,
	loginSettings
}) => {
	const [info, setInfo] = useState<string>("");
	const [error, setError] = useState<string>("");

	const [loading, setLoading] = useState<boolean>(false);

	const router = useRouter();

	const submitPassword = async (values: FormValues) => {
		setError("");
		setLoading(true);

		try {
			const response = await sendPassword({
				loginName,
				organization,
				checks: create(ChecksSchema, {
					password: { password: values.password }
				}),
				requestId
			});

			if (response && "error" in response && response.error) {
				setLoading(false);
				setError(response.error);
				return;
			}

			if (response && "redirect" in response && response.redirect) {
				return router.push(response.redirect);
			}
		} catch {
			setError("Could not verify password");
			setLoading(false);
		}
	};

	const resetPasswordAndContinue = async () => {
		setError("");
		setInfo("");
		setLoading(true);

		try {
			const response = await resetPassword({
				loginName,
				organization,
				requestId
			});

			if (response && "error" in response) {
				setError(response.error);
				setLoading(false);
				return;
			}
		} catch {
			setError("Could not reset password");
			setLoading(false);
		}

		setInfo("Password was reset. Please check your email.");

		const params = new URLSearchParams(
			removeEmptyFields({
				loginName,
				organization,
				requestId
			})
		);

		return router.push("/password/set?" + params);
	};

	return (
		<FormLayout
			title="Login"
			description="Enter your password"
			onCancel={router.back}
			cancelText="Back"
			okLoading={loading}
			onFinish={submitPassword}
			error={error}
		>
			{sessionFactor && (
				<FormItem>
					<UserSessionInfo
						loginName={loginName}
						sessionId={sessionId}
						displayName={sessionFactor.factors?.user?.displayName}
						canSwitch
						organization={organization}
						requestId={requestId}
					/>
				</FormItem>
			)}

			<FormItem
				name="password"
				rules={passwordRule}
				extra={
					loginSettings?.hidePasswordReset && (
						<Button type="link" onClick={resetPasswordAndContinue}>
							Reset Password
						</Button>
					)
				}
			>
				<PasswordInput autoComplete="password" />
			</FormItem>

			{info && (
				<FormItem>
					<Alert message={info} type="info" />
				</FormItem>
			)}
		</FormLayout>
	);
};

export default PasswordForm;

