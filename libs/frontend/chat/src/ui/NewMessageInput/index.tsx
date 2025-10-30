import React, { useCallback, useMemo } from "react";

import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { useLocalStorage } from "@task-manager/react-utils";
import { Button, Flex, Form, Input, Typography } from "antd";
import { throttle } from "throttle-debounce";
import { useSnapshot } from "valtio";

import { useStyles } from "./styles";

import { chatStore } from "../../state";

interface NewMessageInputProps {
	chatId?: string;
	hasTopBar?: boolean;

	onSend: (payload: { text: string; replyTo?: string }) => void;

	onTypingChange?: () => void;
}

interface FormValues {
	text: string;
}

const NewMessageInput: React.FC<NewMessageInputProps> = ({
	onSend,
	onTypingChange,
	hasTopBar,
	chatId
}) => {
	const styles = useStyles({ hasTopBar }).styles;

	const chatStoreSnapshot = useSnapshot(chatStore);

	const [draft, setDraft] = useLocalStorage(`chat:${chatId}:draft`, "");

	const [form] = Form.useForm<FormValues>();

	const initialValues = useMemo<FormValues>(() => ({ text: draft }), [draft]);

	const handleSubmit = useCallback(
		(values: FormValues) => {
			const text = values.text.trim();

			if (!text) return;

			setDraft("");

			onSend({ text, replyTo: chatStore.replayMessage?.id });

			queueMicrotask(() => {
				form.resetFields();
				chatStore.replayMessage = undefined;
			});
		},
		[onSend, form, setDraft]
	);

	const handleTextareaPressEnter: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
		e => {
			e.preventDefault();
			form.submit();
		},
		[form]
	);

	const handleTypingChange = useMemo(
		() =>
			throttle(750, () => {
				onTypingChange?.();
				setDraft(form.getFieldValue("text"));
			}),
		[onTypingChange, form, setDraft]
	);

	return (
		<Form
			initialValues={initialValues}
			form={form}
			className={styles.textareaWrapper}
			onValuesChange={handleTypingChange}
			onFinish={handleSubmit}
		>
			{chatStoreSnapshot.replayMessage && (
				<Flex
					justify="space-between"
					align="center"
					style={{
						backgroundColor: "var(--ant-input-hover-bg)",
						padding: "var(--ant-padding-xxs)",
						width: "100%",
						borderTop: "1px solid var(--ant-color-border)",
						maxWidth: "100%",
						overflow: "hidden"
					}}
				>
					<div style={{ flex: "1", overflow: "hidden" }}>
						<Typography.Text type="secondary">
							Reply to {chatStoreSnapshot.replayMessage?.senderName}
						</Typography.Text>

						<Typography.Paragraph style={{ margin: 0 }} ellipsis={{ tooltip: true }}>
							{chatStoreSnapshot.replayMessage?.text}
						</Typography.Paragraph>
					</div>

					<Button
						type="text"
						size="small"
						icon={<CloseOutlined />}
						onClick={() => (chatStore.replayMessage = undefined)}
					/>
				</Flex>
			)}

			<Form.Item name="text" noStyle>
				<Input.TextArea
					className={styles.textarea}
					aria-autocomplete="none"
					autoComplete="off"
					placeholder="Type your message"
					onPressEnter={handleTextareaPressEnter}
					autoSize={{ minRows: 2, maxRows: 5 }}
				/>
			</Form.Item>

			<Button
				type="text"
				icon={<SendOutlined />}
				className={styles.sendButton}
				htmlType="submit"
			/>
		</Form>
	);
};

export default NewMessageInput;

