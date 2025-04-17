import React, { memo, useMemo } from "react";

import { TaskChatMessage } from "@task-manager/api";
import { Avatar, Typography } from "antd";
import dayjs from "dayjs";

import { useStyles } from "./styles";

const ChatMessage: React.FC<TaskChatMessage> = ({ text, author, createdAt }) => {
	const { dateView, wrapper } = useStyles().styles;

	const date = useMemo(() => dayjs(createdAt).format("HH:mm A"), [createdAt]);

	return (
		<div className={wrapper}>
			<Avatar src={author.picture || "/avatar-placeholder-32.jpg"} alt={author.username} size="small" />

			<div>
				<Typography.Text>{author.username}</Typography.Text>

				<Typography.Text className={dateView}>{date}</Typography.Text>

				<Typography.Paragraph>{text}</Typography.Paragraph>
			</div>
		</div>
	);
};

export default memo(ChatMessage);