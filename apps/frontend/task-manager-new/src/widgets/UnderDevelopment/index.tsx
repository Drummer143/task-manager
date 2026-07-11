import React from "react";

import { Flex, Typography } from "antd";

import { UnderDevelopmentSVG } from "../../shared/icons/UnderDevelopment";

const UnderDevelopment: React.FC = () => {
	return (
		<Flex vertical align="center" justify="center" className="h-full">
			<UnderDevelopmentSVG width={95} hanging={95} />

			<Typography.Title level={3}>This feature is coming soon</Typography.Title>

			<Typography.Text>
				We're still building this section. Check back a little later - it'll be ready in an
				upcoming update
			</Typography.Text>
		</Flex>
	);
};

export default UnderDevelopment;

