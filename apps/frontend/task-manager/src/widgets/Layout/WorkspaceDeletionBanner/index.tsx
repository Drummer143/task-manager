import React, { memo, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getWorkspace } from "@task-manager/api";
import { useStorage } from "@task-manager/react-utils";
import { Alert } from "antd";
import { useLocation } from "react-router-dom";

import { useAuthStore } from "../../../app/store/auth";

const WorkspaceDeletionBanner: React.FC = () => {
	const location = useLocation();

	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const [closed, setClosed] = useStorage("workspace-deletion-banner-closed", false, false, sessionStorage);

	const { data } = useQuery({
		queryKey: ["workspace", workspaceId],
		queryFn: () => getWorkspace({ workspaceId }),
		enabled: !closed && !!workspaceId && !location.pathname.startsWith("/profile")
	});

	const showWorkspaceBanner = !closed && !location.pathname.startsWith("/profile") && data?.deletedAt;

	const deletionDate = useMemo(
		() =>
			!closed && data?.deletedAt
				? new Date(data.deletedAt).toLocaleDateString(undefined, {
						month: "long",
						day: "numeric",
						year: "numeric",
						hour: "numeric",
						minute: "numeric"
					})
				: 0,
		[closed, data?.deletedAt]
	);

	if (!showWorkspaceBanner) {
		return null;
	}

	return (
		<Alert
			banner
			type="warning"
			showIcon
			closable
			onClose={() => setClosed(true)}
			message={`Workspace will be deleted in ${deletionDate}. Contact workspace owner for more information.`}
		/>
	);
};

export default memo(WorkspaceDeletionBanner);