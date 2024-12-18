import React, { memo } from "react";

import ItemWithSubmenu from "./ItemWithSubmenu";
import { MenuListItem, MenuWrapper } from "./styles";

interface MenuProps {
	pages?: Pick<Page, "childrenPages" | "name" | "type" | "id">[] | undefined;
	onSubPageCreate: (parentId: string) => void;
}

const Menu: React.FC<MenuProps> = ({ pages, onSubPageCreate }) => (
	<MenuWrapper>
		{pages?.map(page =>
			page.type === "group" ? (
				<ItemWithSubmenu key={page.id} rootPage={page} onSubPageCreate={onSubPageCreate} />
			) : (
				<MenuListItem key={page.id} to={`/pages/${page.id}`}>
					{page.name}
				</MenuListItem>
			)
		)}
	</MenuWrapper>
);

export default memo(Menu);