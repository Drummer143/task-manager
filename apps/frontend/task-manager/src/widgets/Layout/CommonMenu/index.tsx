import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getWorkspace } from "@task-manager/api";
import { Menu, Spin } from "antd";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { useLocation, useNavigate } from "react-router";

import { useAuthStore } from "../../../app/store/auth";

const CommonMenu: React.FC = () => {
	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const navigate = useNavigate();

	const location = useLocation();

	const { data: workspace, isLoading } = useQuery({
		queryKey: ["workspace", workspaceId],
		queryFn: () => getWorkspace({ pathParams: { workspaceId } }),
		enabled: !!workspaceId
	});

	const menuItems = useMemo<(ItemType<MenuItemType> & { href?: string })[]>(
		() => [
			{
				key: "workspace",
				label: workspace?.name,
				href: "/workspace",
				onClick: () => navigate("/workspace")
			}
		],
		[navigate, workspace?.name]
	);

	const activeItem = useMemo(
		() => menuItems.find(item => item.href === location.pathname)?.key,
		[location.pathname, menuItems]
	);

	if (isLoading || !workspace) {
		return <Spin />;
	}

	return <Menu selectedKeys={[activeItem as string]} items={menuItems} />;
};

export default CommonMenu;