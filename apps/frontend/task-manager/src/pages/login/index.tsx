import React, { useEffect } from "react";

import { userManager } from "../../app/auth";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const Login: React.FC = () => {
	useEffect(() => {
		userManager.signinRedirect();
	}, []);

	return <FullSizeLoader />;
};

export default withAuthPageCheck(Login, false);

