import React, { memo } from "react";

import { ExportOutlined } from "@ant-design/icons";
import { User } from "@task-manager/api/main/schemas";
import { stopPropagation } from "@task-manager/utils";
import { Avatar, Button, Flex, Typography } from "antd";
import { createStyles } from "antd-style";

import { useAuthStore } from "../../app/store/auth";
import { buildStorageUrl } from "../../shared/utils/buildStorageUrl";

interface UserCardProps {
	user: User;

	oneLine?: boolean;
	hideOpenLink?: boolean;
}

const useStyles = createStyles(({ css }) => ({
	username: css`
		font-size: var(--ant-font-size-lg);
	`,
	userEmail: css`
		font-size: var(--ant-font-size-sm);

		color: var(--ant-color-text-secondary);
	`
}));

const UserCard: React.FC<UserCardProps> = ({ user, hideOpenLink, oneLine }) => {
	const { styles } = useStyles();

	const avatarUrl = user.picture
		? buildStorageUrl(user.picture, useAuthStore.getState().identity.access_token)
		: "/avatar-placeholder-32.jpg";

	if (oneLine) {
		return (
			<Flex align="center" gap="var(--ant-padding-xs)">
				<Avatar size="small" src={avatarUrl} alt={user.username} />

				<Typography className={styles.username}>{user.username}</Typography>
			</Flex>
		);
	}

	return (
		<Flex align="center" gap="var(--ant-padding-sm)">
			<Avatar src={avatarUrl} alt={user.username} />

			<Flex vertical>
				{hideOpenLink ? (
					<Typography.Text className={styles.username}>{user.username}</Typography.Text>
				) : (
					<Flex gap="var(--ant-margin-xxs)" align="center">
						<Typography.Text className={styles.username}>
							{user.username}
						</Typography.Text>

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

				<Typography.Text className={styles.userEmail}>{user.email}</Typography.Text>
			</Flex>
		</Flex>
	);
};

export default memo(UserCard);

