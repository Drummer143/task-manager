import React, { useEffect, useState } from "react";

import { lazySuspense, useWindowResize } from "@task-manager/utils";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../app/store/app";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

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
