import React, { memo } from "react";

import { Menu as AntMenu, Flex, Spin } from "antd";
import styled from "styled-components";

import { useDisclosure } from "shared/hooks";
import { useAuthStore } from "store/auth";
import UserMenuInfo from "widgets/Layout/UserMenuInfo";
import { useUserMenuItems } from "widgets/Layout/useUserMenuItems";
import MobileDrawer from "widgets/MobileDrawer";

export const Menu = styled(AntMenu)`
	height: 100%;

	padding: var(--ant-padding);

	border-inline: none !important;
	background-color: transparent;
`;

const UserMenu: React.FC = () => {
	const { items } = useUserMenuItems();

	const { loading, user } = useAuthStore();

	const { open, onOpen, onClose } = useDisclosure();

	if (loading) {
		return (
			<Flex className="h-full">
				<Spin />
			</Flex>
		);
	}

	return (
		<div>
			<UserMenuInfo mobile username={user?.username} picture={user?.picture} onClick={onOpen} />

			<MobileDrawer open={open} onClose={onClose}>
				<Menu mode="inline" items={items} />
			</MobileDrawer>
		</div>
	);
};

export default memo(UserMenu);
