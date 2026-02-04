import React from "react";

import { Flex, Spin } from "antd";

interface FullSizeLoaderProps {
	bgColor?: string;
}

const FullSizeLoader: React.FC<FullSizeLoaderProps> = ({
	bgColor = "var(--ant-color-bg-layer2)"
}) => (
	<Flex align="center" justify="center" style={{ height: "100%", backgroundColor: bgColor }}>
		<Spin size="large" />
	</Flex>
);

export default FullSizeLoader;

