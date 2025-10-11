import React, { useCallback, useMemo } from "react";

import { SendOutlined } from "@ant-design/icons";
import { useLocalStorage } from "@task-manager/react-utils";
import { Button, Form, Input } from "antd";
import { throttle } from "throttle-debounce";

import { useStyles } from "./styles";

interface NewMessageInputProps {
	chatId?: string;
	hasTopBar?: boolean;

	onSend: (message: string) => void;

	onTypingChange?: () => void;
}

interface FormValues {
	message: string;
}

const NewMessageInput: React.FC<NewMessageInputProps> = ({
	onSend,
	onTypingChange,
	hasTopBar,
	chatId
}) => {
	const styles = useStyles({ hasTopBar }).styles;

	const [draft, setDraft] = useLocalStorage(`chat:${chatId}:draft`, "");

	const [form] = Form.useForm<FormValues>();

	const initialValues = useMemo(() => ({ message: draft }), [draft]);

	const handleSubmit = useCallback(
		(values: FormValues) => {
			const message = values.message.trim();

			if (!message) return;

			setDraft("");

			onSend(message);

			queueMicrotask(() => form.resetFields());
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
				setDraft(form.getFieldValue("message"));
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
			<Form.Item name="message" noStyle>
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

