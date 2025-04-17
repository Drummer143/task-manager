import React, { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { parseApiError, signUp } from "@task-manager/api";
import { Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";

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
			headingText="Sign Up"
			submitText="Sign Up"
			onFinish={mutateAsync}
			error={parsedError}
			submitLoading={isPending}
			onValuesChange={reset}
			bottomLink={
				<>
					Already have an account?
					<Link to="/login"> Login</Link>
				</>
			}
		>
			<Form.Item name="username" label="Username" rules={rules.username}>
				<Input placeholder="username" type="text" autoComplete="name" />
			</Form.Item>

			<Form.Item name="email" label="Email" rules={rules.email}>
				<Input type="email" placeholder="email@example.com" />
			</Form.Item>

			<Form.Item name="password" label="Password" rules={rules.password}>
				<Input.Password placeholder="********" autoComplete="new-password" />
			</Form.Item>
		</AuthForm>
	);
};

export default withAuthPageCheck(SignUp, false);