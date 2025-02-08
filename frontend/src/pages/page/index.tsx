import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getPage } from "api";
import { useNavigate, useParams } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";
import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import FullSizeLoader from "shared/ui/FullSizeLoader";
import { useAppStore } from "store/app";

import { PageContainer } from "./styles";
import PageHeader from "./widgets/PageHeader";

const BoardPage = lazySuspense(() => import("./BoardPage"), <FullSizeLoader />);
const TextPage = lazySuspense(() => import("./TextPage"), <FullSizeLoader />);

const Page: React.FC = () => {
	const pageId = useParams<{ id: string }>().id!;

	const workspaceId = useAppStore.getState().workspaceId!;

	const navigate = useNavigate();

	const { data: page, isLoading } = useQuery({
		queryKey: [pageId],
		enabled: !!workspaceId,
		queryFn: () =>
			getPage({
				pageId: pageId,
				workspaceId,
				include: ["childrenPages", "tasks"]
			}).catch(error => {
				navigate("/profile", { replace: true });

				return error;
			})
	});

	if (isLoading) {
		return <FullSizeLoader />;
	}

	return (
		<PageContainer>
			<PageHeader page={page} />

			{page?.type === "board" ? (
				<BoardPage page={page} />
			) : page?.type === "text" ? (
				<TextPage page={page} />
			) : (
				<div>Not implemented</div>
			)}
		</PageContainer>
	);
};

export default withAuthPageCheck(Page);
