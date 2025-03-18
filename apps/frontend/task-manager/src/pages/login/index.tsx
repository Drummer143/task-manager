import React, { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { login, parseApiError } from "@task-manager/api";
import { Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";

import { ResetPasswordLink } from "./styles";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import { composeRules, email, required } from "../../shared/validation";
import AuthForm from "../../widgets/AuthForm";

const rules = {
	email: composeRules(required(), email()),
	password: required()
};

const Login: React.FC = () => {
	const setSession = useAuthStore(state => state.setSession);

	const navigate = useNavigate();

	const { mutateAsync, error, reset, isPending } = useMutation({
		mutationFn: login,
		onSuccess: user => {
			setSession(user);

			navigate("/profile", { replace: true });
		}
	});

	const parsedError = useMemo(() => parseApiError(error, undefined, [400]), [error]);

	return (
		<AuthForm
			onFinish={mutateAsync}
			onValuesChange={reset}
			submitText="Login"
			headingText="Login"
			error={parsedError}
			submitLoading={isPending}
			bottomLink={
				<>
					Don&apos;t have an account?
					<Link to="/sign-up"> Sign up</Link>
				</>
			}
		>
			<Form.Item name="email" label="Email" rules={rules.email}>
				<Input placeholder="email@example.com" />
			</Form.Item>

			<Form.Item
				name="password"
				label="Password"
				rules={rules.password}
				extra={<ResetPasswordLink to="/reset-password">Forgot password?</ResetPasswordLink>}
			>
				<Input.Password placeholder="********" />
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(Login, false);
