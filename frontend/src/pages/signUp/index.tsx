import React, { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { Form, Input } from "antd";
import { signUp } from "api";
import { Link, useNavigate } from "react-router-dom";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import { parseUseQueryError } from "shared/utils/errors";
import { composeRules, email, password, range, required } from "shared/validation";
import { useAuthStore } from "store/auth";
import AuthForm from "widgets/AuthForm";

const rules = {
	username: composeRules(required(), range({ min: 5, max: 20, type: "string" })),
	email: composeRules(required(), email()),
	password: composeRules(required(), password())
};

const SignUp: React.FC = () => {
	const setSession = useAuthStore(state => state.setSession);

	const navigate = useNavigate();

	const { mutateAsync, error, isPending, reset } = useMutation({
		mutationFn: signUp,
		onSuccess: user => {
			setSession(user);

			navigate("/profile", { replace: true });
		}
	});

	const parsedError = useMemo(() => parseUseQueryError(error, undefined, [400]), [error]);

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
