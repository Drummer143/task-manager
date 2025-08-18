import React, { useMemo } from "react";

import { Avatar, Flex, Typography } from "antd";

import { useStyles } from "./styles";

export interface MessageProps {
	text: string;
	createdAt: string;
	sentByCurrentUser: boolean;

	avatarUrl?: string;
	senderName?: string;
	marginBottom?: "small" | "large";

	onSenderClick?: () => void;
}

const Message: React.FC<MessageProps> = ({
	createdAt,
	sentByCurrentUser,
	text,
	onSenderClick,
	senderName,
	avatarUrl,
	marginBottom = "small"
}) => {
	const formattedDate = useMemo(
		() => new Date(createdAt).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" }),
		[createdAt]
	);

	const handleSenderClick = useMemo(
		() =>
			onSenderClick && !sentByCurrentUser
				? (e?: React.MouseEvent<HTMLElement>) => {
						e?.stopPropagation();
						onSenderClick();
					}
				: undefined,
		[onSenderClick, sentByCurrentUser]
	);

	const styles = useStyles({
		sentByCurrentUser,
		senderClickable: !!handleSenderClick,
		marginBottom
	}).styles;

	return (
		<Flex
			className={styles.wrapper}
			align="flex-end"
			justify={sentByCurrentUser ? "flex-end" : undefined}
			gap="var(--ant-padding-xs)"
		>
			{!sentByCurrentUser &&
				(avatarUrl ? (
					<Avatar
						size="small"
						className={styles.avatar}
						src={avatarUrl}
						onClick={handleSenderClick}
					/>
				) : (
					<div className={styles.avatarPlaceholder} />
				))}

			<div className={styles.messageBody}>
				{!sentByCurrentUser && senderName && (
					<Typography.Text
						type="secondary"
						className={styles.senderName}
						onClick={handleSenderClick}
					>
						{senderName}
					</Typography.Text>
				)}

				<Flex justify="space-between" wrap gap="var(--ant-padding-xs)">
					<Typography.Text>{text}</Typography.Text>
					<Typography.Text type="secondary" className={styles.date}>
						{formattedDate}
					</Typography.Text>
				</Flex>
			</div>
		</Flex>
	);
};

export default Message;

