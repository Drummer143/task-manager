import React, { memo } from "react";

import { CloseOutlined } from "@ant-design/icons";
import { Button, Flex, Select } from "antd";
import styled from "styled-components";

import { userBoardRoleOptions } from "shared/utils";
import UserCard from "widgets/UserCard";

interface AccessListItemProps {
	user: User;
	role?: string;
	isPending?: boolean;
	onRoleChange: (userId: string, role?: string) => void;
}

export const ItemWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;

	margin-bottom: var(--ant-margin-sm);
`;

export const RoleSelect = styled(Select)`
	min-width: 7.5rem;
` as typeof Select;

const AccessListItem: React.FC<AccessListItemProps> = ({ user, role, isPending, onRoleChange }) => (
	<ItemWrapper>
		<UserCard user={user} />

		<Flex align="center" gap="var(--ant-margin-xxs)">
			<RoleSelect
				onChange={value => onRoleChange(user.id, value)}
				value={role}
				loading={isPending}
				options={userBoardRoleOptions}
				placeholder="Select role"	
			/>

			<Button type="text" danger size="small" icon={<CloseOutlined />} onClick={() => onRoleChange(user.id)} />
		</Flex>
	</ItemWrapper>
);

export default memo(AccessListItem);
