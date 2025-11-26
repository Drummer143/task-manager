import React, { memo } from "react";

import { useDisclosure } from "@task-manager/react-utils";
import { Flex, Menu, Spin } from "antd";
import { createStyles } from "antd-style";

import { useAuthStore } from "../../../../app/store/auth";
import MobileDrawer from "../../../../widgets/MobileDrawer";
import UserMenuInfo from "../../UserMenuInfo";
import { useUserMenuItems } from "../../useUserMenuItems";

const useStyles = createStyles(({ css }) => ({
	menu: css`
		height: 100%;

		padding: var(--ant-padding);

		border-inline: none !important;
		background-color: transparent;
	`
}));

const UserMenu: React.FC = () => {
	const { items } = useUserMenuItems();

	const { loading, user } = useAuthStore();

	const { open, onOpen, onClose } = useDisclosure();

	const { menu } = useStyles().styles;

	if (loading) {
		return (
			<Flex className="h-full">
				<Spin />
			</Flex>
		);
	}

	return (
		<div>
			<UserMenuInfo mobile username={user.username} picture={user.picture} onClick={onOpen} />

			<MobileDrawer open={open} onClose={onClose}>
				<Menu className={menu} mode="inline" items={items} />
			</MobileDrawer>
		</div>
	);
};

export default memo(UserMenu);