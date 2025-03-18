import React from "react";

import { ExportOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Typography } from "antd";
import styled from "styled-components";

import { stopPropagation } from "shared/utils";

interface UserCardProps {
	user: User;

	hideOpenLink?: boolean;
}

export const UserName = styled(Typography.Text)`
	font-size: var(--ant-font-size-lg);
`;

export const UserEmail = styled(Typography.Text)`
	font-size: var(--ant-font-size-sm);

	color: var(--ant-color-text-secondary);
`;

const UserCard: React.FC<UserCardProps> = ({ user, hideOpenLink }) => {
	return (
		<Flex align="center" gap="var(--ant-padding-sm)">
			<Avatar src={user.picture || "/avatar-placeholder-32.jpg"} alt={user.username} />

			<Flex vertical>
				{hideOpenLink ? (
					<UserName>{user.username}</UserName>
				) : (
					<Flex gap="var(--ant-margin-xxs)" align="center">
						<UserName>{user.username}</UserName>

						<Button
							onClick={stopPropagation}
							type="link"
							target="_blank"
							href={`users/${user.id}`}
							size="small"
							icon={<ExportOutlined />}
						/>
					</Flex>
				)}

				<UserEmail>{user.email}</UserEmail>
			</Flex>
		</Flex>
	);
};

export default UserCard;
