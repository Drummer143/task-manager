import React from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import { useDisclosure } from "shared/hooks";

import EditTaskForm from "./widgets/EditTaskForm";
import NewTaskForm from "./widgets/NewTaskForm";
import TaskTable from "./widgets/TaskTable";

const Tasks: React.FC = () => {
	const { onClose, onOpen, open } = useDisclosure();

	return (
		<>
			<NewTaskForm open={open} onClose={onClose} />
			<EditTaskForm />

			<Button icon={<PlusOutlined />} type="primary" onClick={onOpen}>
				New Task
			</Button>

			<TaskTable />
		</>
	);
};

export default withAuthPageCheck(Tasks);
