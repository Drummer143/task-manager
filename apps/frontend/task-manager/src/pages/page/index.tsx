import React, { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPageDetailed } from "@task-manager/api/main";
import { lazySuspense, useDisclosure } from "@task-manager/react-utils";
import { Navigate, useNavigate, useParams } from "react-router";

import Settings from "./Settings";
import { useStyles } from "./styles";
import PageHeader from "./widgets/PageHeader";

import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import { queryKeys } from "../../shared/queryKeys";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const BoardPage = lazySuspense(() => import("./BoardPage"), <FullSizeLoader />);
const TextPage = lazySuspense(() => import("./TextPage"), <FullSizeLoader />);

const Page: React.FC = () => {
	const { container } = useStyles().styles;

	const { open: settingsOpened, onOpen: openSettings, onClose: closeSettings } = useDisclosure();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const pageId = useParams<{ id: string }>().id!;

	const navigate = useNavigate();

	const { data: page, isLoading } = useQuery({
		queryKey: queryKeys.pages.detail(pageId),
		queryFn: () =>
			getPageDetailed(pageId).catch(error => {
				navigate("/profile", { replace: true });

				throw error;
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
					<PageHeader
						pageTitle={page.title}
						userRoleInPage={page.userRole}
						onSettingsClick={openSettings}
					/>

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

