import React from "react";

import { useAuthStore } from "../../app/store/auth";
import { userManager } from "../../app/userManager";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

export const withAuthPageCheck = <P extends object>(
	Component: React.ComponentType<P>,
	authRequired = true
) => {
	const ProtectedComponent: React.FC<P> = props => {
		const { loading, user, identity } = useAuthStore(state => state);

		if (loading) {
			return <FullSizeLoader />;
		}

		if (!user && !identity) {
			debugger;
			userManager.signinRedirect();

			return <FullSizeLoader />;
		}

		return <Component {...props} />;
	};

	return ProtectedComponent;
};

