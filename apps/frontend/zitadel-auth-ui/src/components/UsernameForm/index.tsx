"use client";

import React, { useCallback, useEffect, useState } from "react";

import { Input } from "antd";
import FormItem from "antd/es/form/FormItem";
import { useRouter } from "next/navigation";

import { required } from "@task-manager/antd-vatidation";

import { sendLoginname } from "../../shared/lib/server/loginname";
import FormLayout from "../FormLayout";

interface UsernameFormProps {
	suffix?: string;
	requestId?: string;
	loginName?: string;
	autoSubmit?: boolean;
	organization?: string;
}

interface FormValues {
	username: string;
}

const requiredRule = required();

const UsernameForm: React.FC<UsernameFormProps> = ({ organization, requestId, suffix, loginName, autoSubmit }) => {
	const [error, setError] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState(false);

	const router = useRouter();

	const submitUsername = useCallback(
		async (values: FormValues) => {
			setError(undefined);
			setLoading(true);

			try {
				const res = await sendLoginname({
					loginName: values.username,
					organization,
					requestId,
					suffix
				});

				if (!res || "error" in res) {
					setLoading(false);
					return setError(res?.error ?? "Internal error occurred");
				}

				if (res.redirect) {
					router.push(res.redirect);
				}
			} catch {
				setError("Internal error occurred");
				setLoading(false);
			}
		},
		[organization, requestId, router, suffix]
	);

	useEffect(() => {
		if (autoSubmit && loginName) {
			submitUsername({ username: loginName });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<FormLayout<FormValues>
			initialValues={{ username: loginName }}
			okLoading={loading}
			onFinish={submitUsername}
			style={{ maxWidth: "400px" }}
			title="Login"
			description="Enter your username"
			error={error}
		>
			<FormItem name="username" label="Username" rules={requiredRule}>
				<Input placeholder="Username" />
			</FormItem>
		</FormLayout>
	);
};

export default UsernameForm;

