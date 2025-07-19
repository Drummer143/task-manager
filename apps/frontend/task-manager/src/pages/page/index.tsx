import React, { useCallback } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPage, Page } from "@task-manager/api";
import { lazySuspense, useSearchParams } from "@task-manager/react-utils";
import { Navigate, useNavigate, useParams } from "react-router";

import Settings from "./Settings";
import { useStyles } from "./styles";
import PageHeader from "./widgets/PageHeader";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const BoardPage = lazySuspense(() => import("./BoardPage"), <FullSizeLoader />);
const TextPage = lazySuspense(() => import("./TextPage"), <FullSizeLoader />);

const PageComponent: React.FC = () => {
	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const { container } = useStyles().styles;

	const [{ settingsOpened }, setParams] = useSearchParams<"taskId" | "settingsOpened">();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const pageId = useParams<{ id: string }>().id!;

	const navigate = useNavigate();

	const openSettings = useCallback(() => setParams({ settingsOpened: "true" }), [setParams]);

	const closeSettings = useCallback(() => setParams({ settingsOpened: null }), [setParams]);

	const { data: page, isLoading } = useQuery({
		queryKey: [pageId],
		enabled: !!workspaceId,
		queryFn: (): Promise<Omit<Page, "tasks" | "owner" | "parentPage">> =>
			getPage({
				pageId,
				workspaceId,
				include: ["childPages", "workspace", "boardStatuses"]
			}).catch(error => {
				navigate("/profile", { replace: true });

				return error;
			})
	});

	if (isLoading) {
		return <FullSizeLoader />;
	}

	if (!page) {
		return <Navigate to="/profile" />;
	}

	return (
		<div className={container}>
			{settingsOpened && (page.role === "admin" || page.role === "owner") ? (
				<Settings page={page} onClose={closeSettings} />
			) : (
				<>
					<PageHeader page={page} onSettingsClick={openSettings} />

					{page?.type === "board" ? (
						<BoardPage page={page} />
					) : page?.type === "text" ? (
						<TextPage page={page} />
					) : (
						<div>Not implemented</div>
					)}
				</>
			)}
		</div>
	);
};

export default withAuthPageCheck(PageComponent);

