import React from "react";

import { Menu } from "antd";

import NavPagesMenu from "../NavPagesMenu";

const NavContent: React.FC = () => (
	<div>
		<Menu />

		<NavPagesMenu />
	</div>
);

export default NavContent;
