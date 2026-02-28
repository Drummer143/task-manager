import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { parseApiError } from "@task-manager/api";
import {
	createWorkspaceAccess,
	getDetailedWorkspace,
	getWorkspaceAccessList,
	updateWorkspaceAccess
} from "@task-manager/api/main";
import { Alert, Divider, Typography } from "antd";

import { useStyles } from "./styles";
import DangerZone from "./widgets/DangerZone";
import PageTree from "./widgets/PageTree";
import WorkspaceInfo from "./widgets/WorkspaceInfo";

import { useAuthStore } from "../../app/store/auth";
import { queryKeys } from "../../shared/queryKeys";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";
import AccessList, { AccessListProps } from "../../widgets/AccessList";

const CurrentWorkspace: React.FC = () => {
	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const { container } = useStyles().styles;

	const {
		data: workspace,
		isLoading: isLoadingWorkspace,
		error: errorWorkspace
	} = useQuery({
		queryKey: queryKeys.workspaces.owner(workspaceId),
		queryFn: () => getDetailedWorkspace(workspaceId)
	});

	const accessListProps = useMemo<AccessListProps>(
		() => ({
			queryKey: queryKeys.workspaceAccess.byWorkspace(workspaceId),
			updateAccess: body => updateWorkspaceAccess(workspaceId, body),
			getAccessList: () => getWorkspaceAccessList(workspaceId),
			createAccess: body => createWorkspaceAccess(workspaceId, body)
		}),
		[workspaceId]
	);

	if (isLoadingWorkspace) {
		return <FullSizeLoader />;
	}

	if (errorWorkspace || !workspace || !workspaceId) {
		return <Alert description={parseApiError(errorWorkspace)} type="error" message="Error" />;
	}

	const editable = workspace?.role === "admin" || workspace?.role === "owner";

	return (
		<div className={container}>
			<Typography.Title level={3}>Workspace settings</Typography.Title>

			<Divider />

			<WorkspaceInfo id={workspace.id} name={workspace.name} editable={editable} />

			<Divider />

			<PageTree workspaceId={workspaceId} editable={editable} />

			<Divider />

			<AccessList editable={editable} {...accessListProps} />

			{workspace.role === "owner" && (
				<>
					<Divider />

					<DangerZone deletedAt={workspace.deletedAt} workspaceId={workspaceId} />
				</>
			)}
		</div>
	);
};

export default CurrentWorkspace;

