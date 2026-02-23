import React from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { required } from "@task-manager/ant-validation";
import { updateProfile } from "@task-manager/api/main";
import { Alert, Button, Flex, Form, Input, Spin } from "antd";

import { useStyles } from "./styles";
import AvatarInput from "./widgets/AvatarUpload";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs";

const requiredRule = required();

const Profile: React.FC = () => {
	const { formsContainer, wrapper } = useStyles().styles;

	const { data, isLoading, error } = useQuery({
		queryFn: useAuthStore.getState().getSession,
		queryKey: ["profile"]
	});

	const queryClient = useQueryClient();

	const { mutateAsync: updateProfileMutation } = useMutation({
		mutationFn: updateProfile,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["profile"]
			});
		}
	});

	if (error) {
		return <Alert description={error.message} type="error" message="Error" />;
	}

	if (isLoading || !data) {
		return <Spin />;
	}

	const initialValues = {
		username: data.user.username,
		email: data.user.email
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
						<Input />
					</Form.Item>

					<Form.Item name="email" label="Email" rules={requiredRule}>
						<Input />
					</Form.Item>

					<Form.Item>
						<Button type="primary" htmlType="submit">
							Save
						</Button>
					</Form.Item>
				</Form>
			</div>

			{/* <AvatarInput avatarUrl={data.user.picture} /> */}
		</Flex>
	);
};

export default withAuthPageCheck(Profile);

