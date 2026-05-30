import React from "react";

import { useMutation } from "@tanstack/react-query";
import { createCallRoom, generateRoomAccessToken } from "@task-manager/api/calls";
import { App, Button, Checkbox, Form, Input } from "antd";
import { createStyles } from "antd-style";
import { useNavigate } from "react-router";

interface FormValues {
	name: string;
	private: boolean;
}

const initialValues: FormValues = {
	name: "",
	private: true
};

const useStyles = createStyles(({ css }) => ({
	form: css`
		display: flex;
		flex-direction: column;
		align-items: center;

		gap: var(--ant-padding);
	`
}));

const CreateRoom: React.FC = () => {
	const navigate = useNavigate();

	const styles = useStyles().styles;

	const message = App.useApp().message;

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async (values: FormValues) => {
			const room = await createCallRoom({
				name: values.name || undefined,
				visibility: values.private ? "private" : "public"
			});

			if (room.visibility === "public") {
				return [room, undefined] as const;
			}

			const token = await generateRoomAccessToken(room.id, { ttlSeconds: 3600 });

			return [room, token] as const;
		},
		onError: () => {
			message.error("Failed to create room");
		},
		onSuccess: ([data, token]) => {
			navigate(`/room/${data.id}${token ? `?token=${token.token}` : ""}`);
		}
	});

	return (
		<Form<FormValues>
			onFinish={mutateAsync}
			className={styles.form}
			initialValues={initialValues}
		>
			<Form.Item noStyle name="name">
				<Input placeholder="Room Name" />
			</Form.Item>

			<Form.Item noStyle name="private" valuePropName="checked">
				<Checkbox>Private Room</Checkbox>
			</Form.Item>

			<Button type="primary" htmlType="submit" loading={isPending}>
				Create Room
			</Button>
		</Form>
	);
};

export default CreateRoom;

