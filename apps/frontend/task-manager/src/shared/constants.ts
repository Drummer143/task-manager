import { PageType, UserRole } from "@task-manager/api";
import { DefaultOptionType } from "antd/es/select";
import dayjs from "dayjs";

export const pageTypes: PageType[] = ["board", "text", "group"];

export const today = dayjs();

export const userBoardRoles: UserRole[] = ["owner", "admin", "member", "commentator", "guest"];

export const userBoardRoleOptions: DefaultOptionType[] = userBoardRoles.map(role => {
	const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

	return {
		label: capitalizedRole,
		title: capitalizedRole,
		value: role,
		key: role
	};
});

