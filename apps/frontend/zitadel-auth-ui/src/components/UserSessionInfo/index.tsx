import React from "react";

import { RightOutlined } from "@ant-design/icons";
import { removeEmptyFields } from "@task-manager/utils/object";
import { Flex } from "antd";
import Text from "antd/es/typography/Text";
import Link from "next/link";

import styles from "./styles.module.css";

import UserAvatar from "../UserAvatar";

interface UserSessionInfoProps {
	loginName?: string;
	displayName?: string;
	canSwitch?: boolean;

	sessionId?: string;
	organization?: string;
	requestId?: string;
}

const UserSessionInfo: React.FC<UserSessionInfoProps> = ({ displayName, sessionId, canSwitch, ...query }) => {
	return (
		<Flex className={styles.wrapper} gap="var(--ant-padding-sm)" align="center">
			<UserAvatar displayName={displayName} loginName={query.loginName} />

			{displayName && <Text className={styles["display-name"]}>{displayName}</Text>}

			{canSwitch && (
				<Link
					className={styles.link}
					href={`/accounts?${new URLSearchParams(removeEmptyFields(query)).toString()}`}
				>
					<RightOutlined />
				</Link>
			)}
		</Flex>
	);
};

export default UserSessionInfo;

