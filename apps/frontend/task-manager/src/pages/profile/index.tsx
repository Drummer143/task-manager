import React from "react";

import { useQuery } from "@tanstack/react-query";
import { Alert, Flex, Spin } from "antd";

import { useStyles } from "./styles";
import AvatarInput from "./widgets/AvatarUpload";
import EmailForm from "./widgets/EmailForm";
import UserInfoForm from "./widgets/UserInfoForm";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs";

const Profile: React.FC = () => {
	const { formsContainer, wrapper } = useStyles().styles;

	const { data, isLoading, error } = useQuery({
		queryFn: useAuthStore.getState().getSession,
		queryKey: ["profile"]
	});

	if (error) {
		return <Alert description={error.message} type="error" message="Error" />;
	}

	if (isLoading || !data) {
		return <Spin />;
	}

	return (
		<Flex className={wrapper} gap="2rem">
			<div className={formsContainer}>
				<UserInfoForm username={data.user.username} />
				<EmailForm email={data.user.email} />
			</div>

			<AvatarInput avatarUrl={data.user.picture} />
		</Flex>
	);
};

export default withAuthPageCheck(Profile);