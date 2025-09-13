import React, { useCallback, useMemo } from "react";

import { SendOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { throttle } from "throttle-debounce";

import { useStyles } from "./styles";

interface NewMessageInputProps {
	hasTopBar?: boolean;

	onSend: (message: string) => void;

	onTypingChange?: () => void;
}

interface FormValues {
	message: string;
}

const NewMessageInput: React.FC<NewMessageInputProps> = ({ onSend, onTypingChange, hasTopBar }) => {
	const styles = useStyles({ hasTopBar }).styles;

	const [form] = Form.useForm<FormValues>();

	const handleSubmit = useCallback(
		(values: FormValues) => {
			const message = values.message.trim();

			if (!message) return;

			onSend(message);
			form.resetFields();
		},
		[onSend, form]
	);

	const handleTextareaPressEnter: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
		e => {
			e.preventDefault();
			form.submit();
		},
		[form]
	);

	const handleTypingChange = useMemo(() => {
		if (!onTypingChange) {
			return;
		}

		return throttle(750, onTypingChange);
	}, [onTypingChange]);

	return (
		<Form
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

