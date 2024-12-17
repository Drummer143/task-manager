import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Menu, MenuProps } from "antd";
import { getPageList } from "api";
import { Link, useLocation } from "react-router-dom";

import FullSizeLoader from "shared/ui/FullSizeLoader";

const NavContent: React.FC = () => {
	const { data, isLoading } = useQuery({
		queryFn: () => getPageList(),
		queryKey: ["nav,page"]
	});

	const pathname = useLocation().pathname;

	const menuItems = useMemo<MenuProps["items"]>(
		() =>
			data?.map(page => {
				const href = `/pages/${page.id}`;

				return {
					key: href,
					title: page.name,
					label: <Link to={href}>{page.name}</Link>
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
