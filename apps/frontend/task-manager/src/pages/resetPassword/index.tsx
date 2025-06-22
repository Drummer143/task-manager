import React, { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { parseApiError /* resetPassword */ } from "@task-manager/api";
import { App, Form, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import AuthPageMessageWrapper from "../../shared/ui/AuthPageMessageWrapper";
import { composeRules, email, required } from "../../shared/validation";
import AuthForm from "../../widgets/AuthForm";

const emailRule = composeRules(required(), email());

const ResetPassword: React.FC = () => {
	const message = App.useApp().message;

	const t = useTranslation("reset_password_page")[0];

	const { mutateAsync, isSuccess, isPending, error, reset } = useMutation({
		mutationFn: () => new Promise(resolve => setTimeout(resolve, 1000)),
		onError: error => message.error(error.message ?? "Failed to reset password")
	});

	const parsedError = useMemo(() => parseApiError(error, undefined, [400, 404]), [error]);

	if (isSuccess) {
		return (
			<AuthPageMessageWrapper>
				<Typography.Title level={3}>{t("success_title")}</Typography.Title>

				<Typography.Paragraph>{t("success_description")}</Typography.Paragraph>

				<Link to="/login">{t("back_to_login")}</Link>
			</AuthPageMessageWrapper>
		);
	}

	return (
		<AuthForm
			submitText={t("submit_button")}
			headingText={t("heading_text")}
			onFinish={mutateAsync}
			error={parsedError}
			submitLoading={isPending}
			onValuesChange={reset}
			bottomLink={<Link to="/login">{t("back_to_login")}</Link>}
		>
			<Form.Item name="email" label={t("email_field_label")} rules={emailRule}>
				<Input
					placeholder={t("email_field_placeholder")}
					type="email"
					autoComplete="email"
					name="email"
				/>
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(ResetPassword, false);

