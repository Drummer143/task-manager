import React, { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceList } from "@task-manager/api";
import { lazySuspense } from "@task-manager/utils";

import { useAppStore } from "../../app/store/app";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const DesktopLayout = lazySuspense(() => import("./Desktop"), <FullSizeLoader />);
// const MobileLayout = lazySuspense(() => import("./Mobile"), <FullSizeLoader />);

const Layout: React.FC = () => {
	// const [mobileLayout, setMobileLayout] = useState(false);

	// useWindowResize("md", setMobileLayout);

	const { workspaceId, setWorkspaceId } = useAppStore();

	const { data: workspaces } = useQuery({
		queryKey: ["workspaces"],
		queryFn: () => getWorkspaceList(),
		enabled: !workspaceId
	});

	useEffect(() => {
		if (!workspaceId && workspaces) {
			setWorkspaceId(workspaces[0].id);
		}
	}, [setWorkspaceId, workspaceId, workspaces]);

	return /* mobileLayout ? <MobileLayout /> :  */ <DesktopLayout />;
};

export default Layout;
