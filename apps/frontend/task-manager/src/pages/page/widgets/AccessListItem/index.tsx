import React, { memo } from "react";

import { CloseOutlined } from "@ant-design/icons";
import { User } from "@task-manager/api";
import { Button, Flex, Select } from "antd";
import { createStyles } from "antd-style";

import { userBoardRoleOptions } from "../../../../shared/constants";
import UserCard from "../../../../widgets/UserCard";

interface AccessListItemProps {
	user: User;
	role?: string;
	isPending?: boolean;
	onRoleChange: (userId: string, role?: string) => void;
}

export const useStyles = createStyles(({ css }) => ({
	itemWrapper: css`
		display: flex;
		justify-content: space-between;
		align-items: center;

		margin-bottom: var(--ant-margin-sm);
	`,
	roleSelect: css`
		min-width: 7.5rem;
	`
}));

const AccessListItem: React.FC<AccessListItemProps> = ({ user, role, isPending, onRoleChange }) => {
	const { itemWrapper, roleSelect } = useStyles().styles;

	return (
		<div className={itemWrapper}>
			<UserCard user={user} />

			<Flex align="center" gap="var(--ant-margin-xxs)">
				<Select
					className={roleSelect}
					onChange={value => onRoleChange(user.id, value)}
					value={role}
					loading={isPending}
					options={userBoardRoleOptions}
					placeholder="Select role"
				/>

				<Button
					type="text"
					danger
					size="small"
					icon={<CloseOutlined />}
					onClick={() => onRoleChange(user.id)}
				/>
			</Flex>
		</div>
	);
};

export default memo(AccessListItem);
