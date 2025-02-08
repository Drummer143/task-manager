import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";
import { useWindowResize } from "shared/hooks/useWindowResize";
import FullSizeLoader from "shared/ui/FullSizeLoader";
import { useAppStore } from "store/app";

const DesktopLayout = lazySuspense(() => import("./Desktop"), <FullSizeLoader />);
const MobileLayout = lazySuspense(() => import("./Mobile"), <FullSizeLoader />);

const Layout: React.FC = () => {
	const [mobileLayout, setMobileLayout] = useState(false);

	const workspaceId = useAppStore(state => state.workspaceId);

	const navigate = useNavigate();

	useWindowResize("md", setMobileLayout);

	useEffect(() => {
		if (!workspaceId && !window.location.pathname.includes("/select-workspace")) {
			navigate("/select-workspace?from=" + window.location.pathname, { replace: true });
		}
	}, [navigate, workspaceId]);

	return mobileLayout ? <MobileLayout /> : <DesktopLayout />;
};

export default Layout;
