import React, { useEffect } from "react";

import { useNavigate } from "react-router";

import { userManager } from "../../app/auth";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const LoginCallback: React.FC = () => {
	const navigate = useNavigate();

	useEffect(() => {
		userManager.signinRedirectCallback().then(() => navigate("/profile"));
	}, [navigate]);

	return <FullSizeLoader />;
};

export default LoginCallback;

