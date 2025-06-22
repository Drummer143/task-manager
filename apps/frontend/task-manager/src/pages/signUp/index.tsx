import React, { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { parseApiError, signUp } from "@task-manager/api";
import { Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import { composeRules, email, password, range, required } from "../../shared/validation";
import AuthForm from "../../widgets/AuthForm";

const rules = {
	username: composeRules(required(), range({ min: 5, max: 20, type: "string" })),
	email: composeRules(required(), email()),
	password: composeRules(required(), password())
};

const SignUp: React.FC = () => {
	const getSession = useAuthStore(state => state.getSession);

	const navigate = useNavigate();

	const t = useTranslation("sign_up_page")[0];

	const { mutateAsync, error, isPending, reset } = useMutation({
		mutationFn: signUp,
		onSuccess: () => {
			getSession();

			navigate("/profile", { replace: true });
		}
	});

	const parsedError = useMemo(() => parseApiError(error, undefined, [400]), [error]);

	return (
		<AuthForm
			headingText={t("title")}
			submitText={t("submit_button")}
			onFinish={mutateAsync}
			error={parsedError}
			submitLoading={isPending}
			onValuesChange={reset}
			bottomLink={
				<>
					{t("already_have_account")}{" "}
					<Link to="/login">{t("login")}</Link>
				</>
			}
		>
			<Form.Item name="username" label={t("username_label")} rules={rules.username}>
				<Input placeholder={t("username_placeholder")} type="text" autoComplete="name" />
			</Form.Item>

			<Form.Item name="email" label={t("email_label")} rules={rules.email}>
				<Input type="email" placeholder={t("email_placeholder")} />
			</Form.Item>

			<Form.Item name="password" label={t("password_label")} rules={rules.password}>
				<Input.Password placeholder={t("password_placeholder")} autoComplete="new-password" />
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(SignUp, false);