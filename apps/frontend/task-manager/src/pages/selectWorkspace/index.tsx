import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { getWorkspaceList } from "@task-manager/api";
import { useDisclosure } from "@task-manager/utils";
import { Flex, List } from "antd";
import { ListLocale } from "antd/es/list";
import { createStyles } from "antd-style";
import { useNavigate } from "react-router-dom";

import CreateWorkspaceButton from "./widgets/CreateWorkspaceButton";
import Settings from "./widgets/Settings";
import WorkspaceButton from "./widgets/WorkspaceButton";
import WorkspaceForm from "./widgets/WorkspaceForm";

import { useAppStore } from "../../app/store/app";
import { withAuthPageCheck } from "../../shared/HOCs/withAuthPageCheck";
import Empty from "../../shared/ui/Empty";

const listLocale: ListLocale = {
	emptyText: <Empty description="You have no workspaces" />
};

const useStyles = createStyles(({ css }) => ({
	list: css`
		.ant-list-items {
			display: flex;
			flex-direction: column;
			gap: var(--ant-margin-sm);
		}
	`
}));

const SelectWorkspace: React.FC = () => {
	const { list } = useStyles().styles;

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
				className={list}
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
