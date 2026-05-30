import { useMemo } from "react";

import { MenuProps } from "antd";

import { userManager } from "../../app/userManager";

export const useUserMenuItems = () => {
	const menu = useMemo<MenuProps>(
		() => ({
			items: [
				{
					key: "logout",
					label: "Log out",
					onClick: () => userManager.signoutRedirect()
				}
			]
		}),
		[]
	);

	return menu;
};
