import React from "react";

import { TeamOutlined } from "@ant-design/icons";
import { useParticipants, useRoomInfo } from "@livekit/components-react";
import { Flex, Space, Typography } from "antd";

import { useStyles } from "./styles";

const Header: React.FC = () => {
	const styles = useStyles().styles;
	const { name } = useRoomInfo();
	const participants = useParticipants();

	return (
		<Flex justify="space-between" align="center" className={styles.header}>
			<Typography.Title level={5} className={styles.title}>
				{name}
			</Typography.Title>

			<Space size="small">
				<TeamOutlined />
				<Typography.Text type="secondary">{participants.length}</Typography.Text>
			</Space>
		</Flex>
	);
};

export default Header;
