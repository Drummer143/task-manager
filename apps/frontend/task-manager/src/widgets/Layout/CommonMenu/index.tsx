import React, { useMemo } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspace } from "@task-manager/api";
import { Menu, Spin } from "antd";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../../app/store/app";

const CommonMenu: React.FC = () => {
	const workspaceId = useAppStore(state => state.workspaceId)!;

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const { data: workspace, isLoading } = useQuery({
		queryKey: ["workspace", workspaceId],
		queryFn: () => getWorkspace({ workspaceId }),
		enabled: !!workspaceId
	});

	const menuItems = useMemo<ItemType<MenuItemType>[]>(
		() => [
			{
				key: "workspace",
				label: workspace?.name,
				onClick: () => navigate(`workspace/${workspace?.id}`)
			}
		],
		[navigate, workspace?.id, workspace?.name]
	);

	if (isLoading || !workspace) {
		return <Spin />;
	}

	return <Menu items={menuItems} />;
};

export default CommonMenu;
