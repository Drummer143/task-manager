import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getPage } from "api";
import { useParams } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";
import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import FullSizeLoader from "shared/ui/FullSizeLoader";

import { PageContainer } from "./styles";
import PageHeader from "./widgets/PageHeader";

const BoardPage = lazySuspense(() => import("./BoardPage"), <FullSizeLoader />);
const TextPage = lazySuspense(() => import("./TextPage"), <FullSizeLoader />);

const Page: React.FC = () => {
	const pageId = useParams<{ id: string }>().id!;

	const { data: page, isLoading } = useQuery({
		queryKey: [pageId],
		queryFn: () => getPage({ id: pageId, include: ["tasks", "childrenPages", "textLines"] })
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
