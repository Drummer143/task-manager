import { PageType, Role } from "@task-manager/api/main/schemas";
import dayjs from "dayjs";

export const pageTypes: PageType[] = ["board", "text", "group"];

export const today = dayjs();

export const userBoardRoles: Role[] = ["owner", "admin", "member", "commentator", "guest"];

export const userBoardRoleOptions = userBoardRoles.map(role => {
	const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

	return {
		label: capitalizedRole,
		title: capitalizedRole,
		value: role,
		key: role
	};
});

