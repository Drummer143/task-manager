import { useEffect, useMemo } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getWorkspaceList, logout } from "@task-manager/api";
import { App, MenuProps } from "antd";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../app/store/app";
import { useAuthStore } from "../../app/store/auth";

export const useUserMenuItems = () => {
	const clearAuthStore = useAuthStore(state => state.clear);
	const { setWorkspaceId, workspaceId } = useAppStore();

	const navigate = useNavigate();

	const message = App.useApp().message;

	const { data, isLoading } = useQuery({
		queryKey: ["workspaces"],
		queryFn: () => getWorkspaceList()
	});

	const { mutateAsync } = useMutation({
		mutationFn: () => logout().then(clearAuthStore),
		onSuccess: () => navigate("/login", { replace: true }),
		onError: error => message.error(error.message ?? "Failed to log out")
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
							disabled: workspace.id === workspaceId,
							onClick: () => setWorkspaceId(workspace.id)
						})) ?? []
				},
				{
					key: "div2",
					type: "divider"
				},
				{
					key: "logout",
					label: "Log out",
					onClick: () => mutateAsync()
				}
			]
		}),
		[data, isLoading, mutateAsync, navigate, setWorkspaceId, workspaceId]
	);

	return menu;
};
