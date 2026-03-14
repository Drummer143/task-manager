/* eslint-disable max-lines */
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { CloseOutlined, SendOutlined } from "@ant-design/icons";
import { useDisclosure, useLocalStorage } from "@task-manager/react-utils";
import { Button, Flex, Form, Image, Input, Typography } from "antd";
import { throttle } from "throttle-debounce";
import { v4 as uuidV4 } from "uuid";
import { useSnapshot } from "valtio";

import { useStyles } from "./styles";

import { chatStore } from "../../state";
import { deleteImage, getImagesByDraftId, saveImage } from "../../utils/idb";
import { AttachmentHandlers, DraftImage } from "../../types";

interface NewMessageInputProps {
	chatId?: string;
	hasTopBar?: boolean;

	onSend: (payload: { text: string; replyTo?: string }) => void;

	onTypingChange?: () => void;

	attachmentHandlers?: AttachmentHandlers;
}

interface FormValues {
	text: string;
}

const NewMessageInput: React.FC<NewMessageInputProps> = ({
	onSend,
	onTypingChange,
	hasTopBar,
	chatId,
	attachmentHandlers
}) => {
	const { styles, cx } = useStyles({ hasTopBar });

	const chatStoreSnapshot = useSnapshot(chatStore);

	const [draft, setDraft] = useLocalStorage(`chat:${chatId}:draft`, "");

	const { open: inputFocused, onClose: onBlur, onOpen: onFocus } = useDisclosure();

	const [attachments, setAttachments] = useState<DraftImage[]>([]);

	const [form] = Form.useForm<FormValues>();

	const initialValues = useMemo<FormValues>(() => ({ text: draft }), [draft]);

	const handleSubmit = useCallback(
		(values: FormValues) => {
			const text = values.text.trim();

			if (!text) return;

			onSend({ text, replyTo: chatStore.replayMessage?.id });

			queueMicrotask(() => {
				form.resetFields();
				chatStore.replayMessage = undefined;
				setDraft("");
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
			throttle<React.KeyboardEventHandler<HTMLTextAreaElement>>(750, e => {
				if (e.code !== "Enter" && e.currentTarget) {
					onTypingChange?.();
					setDraft(e.currentTarget.value);
				}
			}),
		[onTypingChange, setDraft]
	);

	const handlePaste = useCallback(
		(e: React.ClipboardEvent<HTMLTextAreaElement>) => {
			const files: DraftImage[] = [];

			for (let i = 0; i < e.clipboardData.items.length; i++) {
				const item = e.clipboardData.items[i];

				if (item.kind === "file") {
					const file = item.getAsFile();

					if (file) {
						files.push({
							createdAt: Date.now(),
							draftId: `chat:${chatId}:draft`,
							file,
							fileName: file.name,
							mimeType: file.type,
							id: uuidV4()
						});
					}
				}
			}

			if (files.length) {
				e.preventDefault();

				setAttachments(prev => [...prev, ...files]);
				files.forEach(file => {
					saveImage(file);
				});
			}
		},
		[chatId]
	);

	const handleRemoveAttachment = useCallback((id: string) => {
		setAttachments(prev => prev.filter(attachment => attachment.id !== id));
		deleteImage(id);
	}, []);

	useEffect(() => {
		getImagesByDraftId(`chat:${chatId}:draft`).then(setAttachments);
	}, [chatId]);

	return (
		<Form
			initialValues={initialValues}
			form={form}
			className={styles.textareaWrapper}
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

			<div className={cx(styles.inputWrapper, inputFocused && "focused")}>
				<Form.Item name="text" noStyle>
					<Input.TextArea
						variant="borderless"
						className={styles.textarea}
						aria-autocomplete="none"
						autoComplete="off"
						onFocus={onFocus}
						onBlur={onBlur}
						onPaste={handlePaste}
						placeholder="Type your message"
						onKeyDown={handleTypingChange}
						onPressEnter={handleTextareaPressEnter}
						autoSize={{ minRows: 2, maxRows: 5 }}
					/>
				</Form.Item>

				{attachments.length > 0 && (
					<div
						style={{
							display: "flex",
							gap: "var(--ant-padding-xs)",
							margin: "var(--ant-padding-sm)",
							width: "calc(100% - 44px)",
							overflow: "auto visible"
						}}
					>
						{attachments.map(attachment => (
							<div key={attachment.id} style={{ position: "relative" }}>
								{attachment.mimeType.startsWith("image/") ? (
									<div
										style={{
											borderRadius: "var(--ant-border-radius-sm)",
											overflow: "hidden"
										}}
									>
										<Image
											preview={{
												actionsRender: () => null,
												movable: false,
												mask: {
													blur: false
												}
											}}
											width="50px"
											height="50px"
											src={URL.createObjectURL(attachment.file)}
											alt={attachment.fileName}
										/>
									</div>
								) : (
									<div
										title={attachment.fileName}
										style={{
											height: "50px",
											width: "50px",
											backgroundColor: "var(--ant-color-border)",
											borderRadius: "var(--ant-border-radius-sm)",
											overflow: "hidden",
											display: "flex",
											alignItems: "center",
											justifyContent: "flex-start",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
											userSelect: "none"
										}}
									>
										<Typography.Text ellipsis>
											{attachment.fileName}
										</Typography.Text>
									</div>
								)}

								<Button
									size="small"
									shape="round"
									style={{
										position: "absolute",
										top: 0,
										right: 0,
										scale: 0.8,
										transform: "translate(20%, -20%)"
									}}
									icon={<CloseOutlined />}
									onClick={() => handleRemoveAttachment(attachment.id)}
								/>
							</div>
						))}
					</div>
				)}
			</div>

			<Button
				type="text"
				icon={<SendOutlined />}
				className={styles.sendButton}
				htmlType="submit"
			/>
		</Form>
	);
};

export default memo(NewMessageInput);

