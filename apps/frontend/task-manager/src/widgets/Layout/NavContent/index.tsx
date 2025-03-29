import React from "react";

import CommonMenu from "../CommonMenu";
import NavPagesMenu from "../NavPagesMenu";

const NavContent: React.FC = () => (
	<div>
		<CommonMenu />

		<NavPagesMenu />
	</div>
);

export default NavContent;
