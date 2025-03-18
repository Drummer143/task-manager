import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@task-manager/api";
import { Alert, Spin } from "antd";

import { FormsContainer, StyledFlex } from "./styles";
import AvatarInput from "./widgets/AvatarUpload";
import EmailForm from "./widgets/EmailForm";
import UserInfoForm from "./widgets/UserInfoForm";

import { withAuthPageCheck } from "../../shared/HOCs";

const Profile: React.FC = () => {
	const { data, isLoading, error } = useQuery({
		queryFn: getProfile,
		queryKey: ["profile"]
	});

	if (error) {
		return <Alert description={error.message} type="error" message="Error" />;
	}

	if (isLoading || !data) {
		return <Spin />;
	}

	return (
		<StyledFlex gap="2rem">
			<FormsContainer>
				<UserInfoForm username={data.username} />
				<EmailForm email={data.email} />
			</FormsContainer>

			<AvatarInput avatarUrl={data.picture} />
		</StyledFlex>
	);
};

export default withAuthPageCheck(Profile);
