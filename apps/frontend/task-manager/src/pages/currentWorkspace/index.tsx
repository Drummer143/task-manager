import React, { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import {
	createWorkspaceAccess,
	getWorkspace,
	getWorkspaceAccess,
	parseApiError,
	updateWorkspaceAccess
} from "@task-manager/api";
import { Alert, Divider, Typography } from "antd";

import { useStyles } from "./styles";
import DangerZone from "./widgets/DangerZone";
import PageTree from "./widgets/PageTree";
import WorkspaceInfo from "./widgets/WorkspaceInfo";

import { useAuthStore } from "../../app/store/auth";
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
		queryKey: ["workspace", "owner", workspaceId],
		queryFn: () =>
			getWorkspace({
				pathParams: {
					workspaceId,
					include: ["owner"]
				}
			})
	});

	const accessListProps = useMemo<AccessListProps>(
		() => ({
			queryKey: ["access", workspaceId],
			updateAccess: body =>
				updateWorkspaceAccess({
					pathParams: { workspaceId },
					body
				}),
			getAccessList: () =>
				getWorkspaceAccess({
					pathParams: { workspaceId }
				}),
			createAccess: body =>
				createWorkspaceAccess({
					pathParams: { workspaceId },
					body
				})
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

			<WorkspaceInfo workspace={workspace} editable={editable} />

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

