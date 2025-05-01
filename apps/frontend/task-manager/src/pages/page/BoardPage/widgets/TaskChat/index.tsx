import React from "react";

import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { sendMessage } from "@task-manager/api";
import { useDisclosure, useFunctionWithFeedback } from "@task-manager/react-utils";
import { Button, Flex, Form, Input } from "antd";
import { createStyles } from "antd-style";
import { useParams, useSearchParams } from "react-router-dom";

import { useAuthStore } from "../../../../../app/store/auth";
import Drawer from "../../../../../widgets/Drawer";
import ChatMessageList from "../ChatMessageList";

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
	`,
	inputForm: css`
		padding: var(--ant-padding);
	`
}));

const TaskChat: React.FC = () => {
	const { open, onOpen, onClose } = useDisclosure();

	const { drawerBody, drawer, inputForm } = useStyles().styles;

	const taskId = useSearchParams()[0].get("taskId")!;
	const pageId = useParams<{ id: string }>().id!;
	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const [form] = Form.useForm<{ text: string }>();

	const { isPending, mutateAsync } = useMutation({
		mutationFn: (text: string) => sendMessage({ pageId, taskId, workspaceId, text })
	});

	const handleSendMessage = useFunctionWithFeedback({
		callback: async (values: { text: string }) => {
			const result = await mutateAsync(values.text);

			if (result) {
				form.resetFields();
			}

			return true;
		},
		message: "Failed to send message"
	});

	return (
		<>
			<Button type="text" icon={<MessageOutlined />} onClick={onOpen} />

			<Drawer
				drawerRender={node => <Flex vertical>{node}</Flex>}
				open={open}
				onClose={onClose}
				title="Discussion"
				classNames={{ body: drawerBody, wrapper: drawer }}
			>
				<ChatMessageList enabled={open} pageId={pageId} taskId={taskId} workspaceId={workspaceId} />

				<Form className={inputForm} onFinish={handleSendMessage} form={form}>
					<Form.Item name="text" noStyle>
						<Input
							placeholder="Type your message"
							suffix={
								<Button
									type="text"
									shape="circle"
									loading={isPending}
									htmlType="submit"
									icon={<SendOutlined />}
								/>
							}
						/>
					</Form.Item>
				</Form>
			</Drawer>
		</>
	);
};

export default TaskChat;