import { useMemo } from "react";

import { useMutation } from "@tanstack/react-query";
import { MenuProps } from "antd";
import { logout } from "api";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "store/auth";

export const useUserMenuItems = () => {
	const clear = useAuthStore(state => state.clear);

	const navigate = useNavigate();

	const { mutateAsync } = useMutation({
		mutationFn: () => logout().then(clear),
		onSuccess: () => navigate("/login", { replace: true })
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
					key: "logout",
					label: "Log out",
					onClick: () => mutateAsync()
				}
			]
		}),
		[mutateAsync, navigate]
	);

	return menu;
};
