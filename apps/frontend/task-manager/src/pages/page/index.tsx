import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getPage } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useStyles } from "./styles";
import PageHeader from "./widgets/PageHeader";

import { useAuthStore } from "../../app/store/auth";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";

const BoardPage = lazySuspense(() => import("./BoardPage"), <FullSizeLoader />);
const TextPage = lazySuspense(() => import("./TextPage"), <FullSizeLoader />);

const Page: React.FC = () => {
	const { container } = useStyles().styles;

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
				include: ["childPages", "tasks"]
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
			<PageHeader page={page} />

			{page?.type === "board" ? (
				<BoardPage page={page} />
			) : page?.type === "text" ? (
				<TextPage page={page} />
			) : (
				<div>Not implemented</div>
			)}
		</div>
	);
};

export default withAuthPageCheck(Page);