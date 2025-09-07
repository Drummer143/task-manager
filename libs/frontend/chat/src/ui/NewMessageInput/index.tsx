import React, { useCallback } from "react";

import { SendOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";

import { useStyles } from "./styles";

interface NewMessageInputProps {
	onSend: (message: string) => void;
}

interface FormValues {
	message: string;
}

const NewMessageInput: React.FC<NewMessageInputProps> = ({ onSend }) => {
	const styles = useStyles().styles;

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

	return (
		<Form form={form} className={styles.textareaWrapper} onFinish={handleSubmit}>
			<Form.Item name="message" noStyle>
				<Input.TextArea
					className={styles.textarea}
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

