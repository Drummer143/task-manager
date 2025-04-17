import React, { memo } from "react";

import { CloseOutlined } from "@ant-design/icons";
import { User } from "@task-manager/api";
import { Button, Flex, Select, Typography } from "antd";

import { useStyles } from "./styles";

import { userBoardRoleOptions } from "../../../shared/constants";
import UserCard from "../../UserCard";

interface AccessListItemProps {
	user: User;
	role?: string;
	editable?: boolean;
	isPending?: boolean;

	onRoleChange?: (body: { userId: string; role?: string }) => void;
}

const AccessListItem: React.FC<AccessListItemProps> = ({ user, role, isPending, onRoleChange, editable }) => {
	const { itemWrapper, roleSelect } = useStyles().styles;

	return (
		<div className={itemWrapper}>
			<UserCard user={user} />

			{editable ? (
				<Flex align="center" gap="var(--ant-margin-xxs)">
					<Select
						className={roleSelect}
						onChange={role => onRoleChange?.({ userId: user.id, role })}
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
						onClick={() => onRoleChange?.({ userId: user.id })}
					/>
				</Flex>
			) : (
				<Typography.Text>{role}</Typography.Text>
			)}
		</div>
	);
};

export default memo(AccessListItem);
