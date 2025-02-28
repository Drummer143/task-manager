import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { List as AntList, Flex } from "antd";
import { ListLocale } from "antd/es/list";
import { getWorkspaceList } from "api";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import { useDisclosure } from "shared/hooks";
import Empty from "shared/ui/Empty";
import { useAppStore } from "store/app";

import CreateWorkspaceButton from "./widgets/CreateWorkspaceButton";
import Settings from "./widgets/Settings";
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

	const [settingWorkspace, setSettingWorkspace] = useState<string | undefined>(undefined);

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
						onSettingsClick={() => setSettingWorkspace(workspace.id)}
						name={workspace.name}
						onClick={() => handleWorkspaceClick(workspace.id)}
						key={workspace.id}
					/>
				)}
			/>

			<CreateWorkspaceButton onClick={showFromOpen} />

			<Settings
				open={!!settingWorkspace}
				onClose={() => setSettingWorkspace(undefined)}
				workspaceId={settingWorkspace!}
			/>
		</Flex>
	);
};

export default withAuthPageCheck(SelectWorkspace);
