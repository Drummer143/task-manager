import React, { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPage } from "@task-manager/api";
import { lazySuspense, useDisclosure } from "@task-manager/react-utils";
import { Navigate, useNavigate, useParams } from "react-router";

import Settings from "./Settings";
import { useStyles } from "./styles";
import PageHeader from "./widgets/PageHeader";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const BoardPage = lazySuspense(() => import("./BoardPage"), <FullSizeLoader />);
const TextPage = lazySuspense(() => import("./TextPage"), <FullSizeLoader />);

const Page: React.FC = () => {
	const { container } = useStyles().styles;

	const { open: settingsOpened, onOpen: openSettings, onClose: closeSettings } = useDisclosure();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const pageId = useParams<{ id: string }>().id!;

	const workspaceId = useAuthStore.getState().user.workspace.id;

	const navigate = useNavigate();

	const { data: page, isLoading } = useQuery({
		queryKey: [pageId],
		enabled: !!workspaceId,
		queryFn: () =>
			getPage({
				pageId,
				workspaceId,
				include: ["childPages", "workspace", "boardStatuses"]
			}).catch(error => {
				navigate("/profile", { replace: true });

				return error;
			})
	});

	useEffect(() => {
		return () => {
			closeSettings();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pageId]);

	if (isLoading) {
		return <FullSizeLoader />;
	}

	if (!page) {
		return <Navigate to="/profile" />;
	}

	return (
		<div className={container}>
			{settingsOpened ? (
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

export default withAuthPageCheck(Page);

