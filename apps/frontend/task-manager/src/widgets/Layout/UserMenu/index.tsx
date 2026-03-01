import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@task-manager/api/main";
import { Dropdown, Flex, Spin } from "antd";

import { queryKeys } from "../../../shared/queryKeys";
import UserMenuInfo from "../../../widgets/Layout/UserMenuInfo";
import { useUserMenuItems } from "../../../widgets/Layout/useUserMenuItems";

const UserMenu: React.FC = () => {
	const { data, isLoading } = useQuery({
		queryFn: getProfile,
		queryKey: queryKeys.profile.root()
	});

	const menu = useUserMenuItems();

	if (isLoading || !data) {
		return (
			<Flex style={{ width: "100px" }}>
				<Spin />
			</Flex>
		);
	}

	return (
		<Dropdown menu={menu} trigger={["click"]}>
			<div>
				<UserMenuInfo username={data.username} picture={data.picture} />
			</div>
		</Dropdown>
	);
};

export default UserMenu;

