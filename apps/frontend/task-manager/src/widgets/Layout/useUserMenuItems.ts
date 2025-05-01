import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceList } from "@task-manager/api";
import { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

import { userManager } from "../../app/auth";
import { useAuthStore } from "../../app/store/auth";

export const useUserMenuItems = () => {
	const { user } = useAuthStore();

	const navigate = useNavigate();

	const { data, isLoading } = useQuery({
		queryKey: ["workspaces"],
		queryFn: () => getWorkspaceList()
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
						data?.map(workspace => ({
							key: workspace.id,
							label: workspace.name,
							disabled: workspace.id === user?.workspace.id,
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
					onClick: () => userManager.signoutRedirect({})
				}
			]
		}),
		[data, isLoading, navigate, user?.workspace.id]
	);

	return menu;
};
