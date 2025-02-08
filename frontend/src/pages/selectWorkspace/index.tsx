import React from "react";

import { useQuery } from "@tanstack/react-query";
import { List as AntList, Flex } from "antd";
import { ListLocale } from "antd/es/list";
import { getWorkspaceList } from "api";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useDisclosure } from "shared/hooks";
import Empty from "shared/ui/Empty";
import { useAppStore } from "store/app";

import CreateWorkspaceButton from "./widgets/CreateWorkspaceButton";
import WorkspaceButton from "./widgets/WorkspaceButton";
import WorkspaceForm from "./widgets/WorkspaceForm";

const listLocale: ListLocale = {
	emptyText: <Empty description="You have no workspaces" />
};

const List = styled(AntList)`
	.ant-list-items {
		display: flex;
		flex-direction: column;
		gap: var(--ant-margin-sm);
	}
` as typeof AntList;

const SelectWorkspace: React.FC = () => {
	const { data: workspaces } = useQuery({
		queryKey: ["workspaces"],
		queryFn: () => getWorkspaceList(["owner"])
	});

	const { open: showFrom, onOpen: showFromOpen, onClose: showFromClose } = useDisclosure();

	const setWorkspace = useAppStore(state => state.setWorkspaceId);

	const navigate = useNavigate();

	const handleWorkspaceClick = (id: string) => {
		setWorkspace(id);

		const from = new URLSearchParams(window.location.search).get("from");

		navigate(from || "/");
	};

	if (showFrom) {
		return <WorkspaceForm onClose={showFromClose} onSubmit={handleWorkspaceClick} />;
	}

	return (
		<Flex align="center" justify="center" className="w-full h-full" vertical gap="var(--ant-margin-sm)">
			<List
				locale={listLocale}
				dataSource={workspaces || []}
				renderItem={workspace => (
					<WorkspaceButton
						name={workspace.name}
						onClick={() => handleWorkspaceClick(workspace.id)}
						key={workspace.id}
					/>
				)}
			/>

			<CreateWorkspaceButton onClick={showFromOpen} />
		</Flex>
	);
};

export default SelectWorkspace;
