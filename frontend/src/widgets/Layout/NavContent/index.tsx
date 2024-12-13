import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Menu, MenuProps } from "antd";
import { getBoardList } from "api";
import { Link, useLocation } from "react-router-dom";

import FullSizeLoader from "shared/ui/FullSizeLoader";

const NavContent: React.FC = () => {
	const { data, isLoading } = useQuery({
		queryFn: () => getBoardList(),
		queryKey: ["nav,board"]
	});

	const pathname = useLocation().pathname;

	const menuItems = useMemo<MenuProps["items"]>(
		() =>
			data?.map(board => {
				const href = `/boards/${board.id}`;

				return {
					key: href,
					title: board.name,
					label: <Link to={href}>{board.name}</Link>
				};
			}),
		[data]
	);

	if (isLoading) {
		return <FullSizeLoader />;
	}

	return (
		<div>
			<Menu mode="inline" selectedKeys={[pathname]} items={menuItems} />
		</div>
	);
};

export default NavContent;
