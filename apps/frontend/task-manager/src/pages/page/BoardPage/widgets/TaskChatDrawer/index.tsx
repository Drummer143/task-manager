import React, { useMemo } from "react";

import { MessageOutlined } from "@ant-design/icons";
import { useDisclosure } from "@task-manager/react-utils";
import { Button } from "antd";
import { DrawerClassNamesType } from "antd/es/drawer/DrawerPanel";
import { createStyles } from "antd-style";
import { useSearchParams } from "react-router";

import Drawer from "../../../../../widgets/Drawer";
import TaskChat from "../../../../../widgets/TaskChat";

const useStyles = createStyles(({ css }) => ({
	drawer: css`
		height: 100%;

		& > * {
			max-height: 100%;
		}
	`,
	drawerBody: css`
		height: 100%;

		display: flex;
		flex-direction: column;

		padding: 0 !important;
	`
}));

const TaskChatDrawer: React.FC = () => {
	const { open, onOpen, onClose } = useDisclosure();

	const taskId = useSearchParams()[0].get("taskId");

	const styles = useStyles().styles;

	const drawerClassnames = useMemo<DrawerClassNamesType>(
		() => ({
			body: styles.drawerBody,
			wrapper: styles.drawer
		}),
		[styles]
	);

	return (
		<>
			<Drawer
				keyboard={false}
				open={open}
				onClose={onClose}
				title="Discussion"
				destroyOnHidden
				classNames={drawerClassnames}
			>
				<TaskChat taskId={taskId ?? undefined} />
			</Drawer>

			<Button type="text" icon={<MessageOutlined />} onClick={onOpen} />
		</>
	);
};

export default TaskChatDrawer;

