import React from "react";

import { Dropdown, Flex, Spin } from "antd";

import { useAuthStore } from "../../../app/store/auth";
import UserMenuInfo from "../../../widgets/Layout/UserMenuInfo";
import { useUserMenuItems } from "../../../widgets/Layout/useUserMenuItems";

const UserMenu: React.FC = () => {
	const { user, loading } = useAuthStore(state => state);

	const menu = useUserMenuItems();

	if (loading) {
		return (
			<Flex style={{ width: "100px" }}>
				<Spin />
			</Flex>
		);
	}

	return (
		<Dropdown menu={menu} trigger={["click"]}>
			<div>
				<UserMenuInfo username={user.username} picture={user.picture} />
			</div>
		</Dropdown>
	);
};

export default UserMenu;

