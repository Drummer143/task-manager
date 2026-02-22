import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getWorkspacesList } from "@task-manager/api/main";
import { MenuProps } from "antd";
import { useNavigate } from "react-router";

import { useAuthStore } from "../../app/store/auth";
import { userManager } from "../../app/userManager";

export const useUserMenuItems = () => {
	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const navigate = useNavigate();

	const { data, isLoading } = useQuery({
		queryKey: ["workspaces"],
		queryFn: () => getWorkspacesList({ limit: -1 })
	});

	const menu = useMemo<MenuProps>(
		() => ({
			items: [
				{
					key: "profile",
					label: "Profile",
					onClick: () => navigate("/profile")
				},
				{
					key: "div1",
					type: "divider"
				},
				{
					key: "workspace",
					label: data ? "Change workspace" : "Loading...",
					disabled: isLoading,
					type: data ? "submenu" : undefined,
					children:
						data?.data.map(workspace => ({
							key: workspace.id,
							label: workspace.name,
							disabled: workspace.id === workspaceId,
							onClick: () => {
								// eslint-disable-next-line no-restricted-globals
								if (!location.pathname.startsWith("/profile")) {
									navigate(`workspace/${workspace.id}`);
								}

								// setWorkspaceId(workspace.id);
							}
						})) ?? []
				},
				{
					key: "div2",
					type: "divider"
				},
				{
					key: "logout",
					label: "Log out",
					onClick: () => userManager.signoutRedirect()
				}
			]
		}),
		[data, isLoading, navigate, workspaceId]
	);

	return menu;
};

