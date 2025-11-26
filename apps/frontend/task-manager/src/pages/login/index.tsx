import React, { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { login, parseApiError } from "@task-manager/api";
import { Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { useStyles } from "./styles";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import { composeRules, email, required } from "../../shared/validation";
import AuthForm from "../../widgets/AuthForm";

const rules = {
	email: composeRules(required(), email()),
	password: required()
};

const Login: React.FC = () => {
	const { resetPasswordLink } = useStyles().styles;

	const navigate = useNavigate();

	const t = useTranslation("login_page")[0];

	const { mutateAsync, error, reset, isPending } = useMutation({
		mutationFn: login,
		onSuccess: () => {
			useAuthStore.getState().getSession();

			navigate("/profile", { replace: true });
		}
	});

	const parsedError = useMemo(() => parseApiError(error, undefined, [400]), [error]);

	return (
		<AuthForm
			onFinish={mutateAsync}
			onValuesChange={reset}
			submitText={t("submit_button")}
			headingText={t("title")}
			error={parsedError}
			submitLoading={isPending}
			bottomLink={
				<>
					{t("dont_have_account")} <Link to="/sign-up">{t("sign_in")}</Link>
				</>
			}
		>
			<Form.Item name="email" label={t("email_field_label")} rules={rules.email}>
				<Input placeholder={t("email_field_placeholder")} />
			</Form.Item>

			<Form.Item
				name="password"
				label={t("password_field_label")}
				rules={rules.password}
				extra={
					<Link to="/reset-password" className={resetPasswordLink}>
						{t("forgot_password")}
					</Link>
				}
			>
				<Input.Password placeholder={t("password_field_placeholder")} />
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(Login, false);

