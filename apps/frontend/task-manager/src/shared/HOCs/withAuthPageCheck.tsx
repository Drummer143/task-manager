import React from "react";

import { Navigate } from "react-router-dom";

import { useAuthStore } from "../../app/store/auth";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

export const withAuthPageCheck = <P extends object>(Component: React.ComponentType<P>, authRequired = true) => {
	const ProtectedComponent: React.FC<P> = props => {
		const { loading, user } = useAuthStore(state => state);

		if (loading) {
			return <FullSizeLoader />;
		}

		if (!user === authRequired) {
			return <Navigate to={authRequired ? "/login" : "/profile"} replace />;
		}

		return <Component {...props} />;
	};

	return ProtectedComponent;
};