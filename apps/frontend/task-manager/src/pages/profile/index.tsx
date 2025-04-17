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

	const { getSession } = useAuthStore();

	const { data, isLoading, error } = useQuery({
		queryFn: getSession,
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
				<UserInfoForm username={data.username} />
				<EmailForm email={data.email} />
			</div>

			<AvatarInput avatarUrl={data.picture} />
		</Flex>
	);
};

export default withAuthPageCheck(Profile);
