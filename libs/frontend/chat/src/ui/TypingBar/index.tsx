import React, { useMemo } from "react";

import { Button, Tooltip, Typography } from "antd";

import { useStyles } from "./styles";

import { UserInfo } from "../../types";

interface TypingBarProps {
	typingUsers: UserInfo[];

	onUserClick?: (userId: string) => void;
}

const TypingBar: React.FC<TypingBarProps> = ({ typingUsers, onUserClick }) => {
	const styles = useStyles().styles;

	const { firstTwoUsers, leftUsers } = useMemo(() => {
		return {
			firstTwoUsers: typingUsers.slice(0, 2),
			leftUsers: typingUsers.slice(2)
		};
	}, [typingUsers]);

	const userRenderer = useMemo(() => {
		let userRenderer: (user: UserInfo) => React.ReactNode;

		if (onUserClick) {
			userRenderer = (user: UserInfo) => (
				<Button type="link" key={user.id} onClick={() => onUserClick(user.id)}>
					{user.username}
				</Button>
			);
		} else {
			userRenderer = (user: UserInfo) => (
				<Typography.Text key={user.id}>{user.username}</Typography.Text>
			);
		}

		return (user: UserInfo, index: number, users: UserInfo[]) => (
			<>
				{userRenderer(user)}

				{index < users.length - 1 && <span>, </span>}
			</>
		);
	}, [onUserClick]);

	return (
		<div className={styles.wrapper}>
			{firstTwoUsers.map(userRenderer)}

			{leftUsers.length > 0 && (
				<Tooltip title={leftUsers.map(userRenderer)}>
					<Typography.Text>and {leftUsers.length} more</Typography.Text>
				</Tooltip>
			)}

			<Typography.Text> {typingUsers.length > 1 ? "are" : "is"} typing...</Typography.Text>
		</div>
	);
};

export default TypingBar;

