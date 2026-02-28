import React from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { required } from "@task-manager/ant-validation";
import { getProfile, updateProfile } from "@task-manager/api/main";
import { User, Workspace } from "@task-manager/api/main/schemas";
import { Alert, Button, Flex, Form, Input, Spin } from "antd";

import { useStyles } from "./styles";
import AvatarInput from "./widgets/AvatarUpload";

import { withAuthPageCheck } from "../../shared/HOCs";

const requiredRule = required();

const Profile: React.FC = () => {
	const { formsContainer, wrapper } = useStyles().styles;

	const { data, isLoading, error } = useQuery({
		queryFn: getProfile,
		queryKey: ["profile"]
	});

	const queryClient = useQueryClient();

	const { mutateAsync: updateProfileMutation, isPending } = useMutation({
		mutationFn: updateProfile,
		onSuccess: data => {
			const profile = queryClient.getQueryData<(User & { workspace: Workspace }) | null>([
				"profile"
			]);

			if (profile?.workspace) {
				queryClient.setQueryData(["profile"], {
					...data,
					workspace: profile?.workspace
				});
			}
		}
	});

	if (error) {
		return <Alert description={error.message} type="error" message="Error" />;
	}

	if (isLoading || !data) {
		return <Spin />;
	}

	const initialValues = {
		username: data.username,
		email: data.email
	};

	return (
		<Flex className={wrapper} gap="2rem">
			<div className={formsContainer}>
				<Form
					layout="vertical"
					initialValues={initialValues}
					onFinish={updateProfileMutation}
				>
					<Form.Item name="username" label="Username" rules={requiredRule}>
						<Input data-test-id="profile-username-input" />
					</Form.Item>

					<Form.Item name="email" label="Email" rules={requiredRule}>
						<Input data-test-id="profile-email-input" />
					</Form.Item>

					<Form.Item>
						<Button
							data-test-id="profile-save-button"
							loading={isPending}
							type="primary"
							htmlType="submit"
						>
							Save
						</Button>
					</Form.Item>
				</Form>
			</div>

			<AvatarInput avatarUrl={data.picture} isAvatarDefault={data.isAvatarDefault} />
		</Flex>
	);
};

export default withAuthPageCheck(Profile);

