import React, { memo, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { getPageList } from "@task-manager/api/main";
import { Empty, Tree, Typography } from "antd";

import { preparePageTree } from "./utils";

import { queryKeys } from "../../../../shared/queryKeys";

interface PageTreeProps {
	workspaceId: string;

	editable?: boolean;
}

const PageTree: React.FC<PageTreeProps> = ({ workspaceId, editable }) => {
	const { data: pages, isLoading } = useQuery({
		queryKey: queryKeys.pages.tree(workspaceId),
		queryFn: () => getPageList(workspaceId, { format: "tree" })
	});

	const pageTree = useMemo(() => preparePageTree(pages, editable), [editable, pages]);

	return (
		<>
			<Typography.Title level={4}>Pages</Typography.Title>

			{isLoading || pages ? (
				<Tree treeData={pageTree} />
			) : (
				<Empty description="There is no pages in this workspace or you don't have access to any" />
			)}
		</>
	);
};

export default memo(PageTree);

