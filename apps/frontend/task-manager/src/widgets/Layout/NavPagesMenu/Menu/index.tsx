import React, { memo } from "react";

import { PageResponse } from "@task-manager/api/main/schemas";
import { NavLink } from "react-router";

import ItemWithSubmenu from "./ItemWithSubmenu";
import { useStyles } from "./styles";

interface MenuProps {
	pages?: PageResponse[] | undefined;
	onSubPageCreate: (parentId: string) => void;
}

const Menu: React.FC<MenuProps> = ({ pages, onSubPageCreate }) => {
	const { cx, styles } = useStyles();

	return (
		<div className={cx(styles.menuWrapper, "menu css-var-_r_0_ ant-menu-css-var")}>
			{pages?.map(page =>
				page.type === "group" ? (
					<ItemWithSubmenu
						key={page.id}
						rootPage={page}
						onSubPageCreate={onSubPageCreate}
					/>
				) : (
					<NavLink
						className={({ isActive }) => cx(styles.menuListItem, isActive && "active")}
						key={page.id}
						to={`/pages/${page.id}`}
					>
						{page.title}
					</NavLink>
				)
			)}
		</div>
	);
};

export default memo(Menu);

