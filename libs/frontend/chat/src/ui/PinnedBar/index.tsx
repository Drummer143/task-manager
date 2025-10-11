import React, { useMemo } from "react";

import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Flex, Space, Typography } from "antd";
import { EllipsisConfig } from "antd/es/typography/Base";

import { useStyles } from "./styles";

import { MessageData } from "../../types";

interface PinnedBarProps {
	pins: MessageData[];
}

const pinTextEllipsis: EllipsisConfig = {
	rows: 1,
	expandable: false
};

const PinnedBar: React.FC<PinnedBarProps> = ({ pins }) => {
	const [visiblePinIdx, setVisiblePinIdx] = React.useState<number>(() =>
		Math.max(pins.length - 1, 0)
	);

	const lastPinned = pins.at(visiblePinIdx);

	const styles = useStyles().styles;

	const { handleUpClick, handleDownClick } = useMemo(
		() => ({
			handleUpClick: () => setVisiblePinIdx(prev => (prev + 1) % pins.length),
			handleDownClick: () => setVisiblePinIdx(prev => (prev - 1 + pins.length) % pins.length)
		}),
		[pins.length]
	);

	if (!lastPinned) {
		return;
	}

	return (
		<Flex
			justify="space-between"
			align="center"
			gap="var(--ant-padding-xs)"
			className={styles.wrapper}
		>
			<Button type="text" className={styles.pinTextWrapper}>
				<Typography.Paragraph className={styles.senderName}>
					{lastPinned.sender.username}
				</Typography.Paragraph>

				<Typography.Paragraph
					ellipsis={pinTextEllipsis}
					className={styles.pinText}
				>
					{lastPinned.text}
				</Typography.Paragraph>
			</Button>

			<Button size="small" shape="round">
				{visiblePinIdx + 1} / {pins.length}
			</Button>

			<Space.Compact size="small" direction="vertical">
				<Button onClick={handleUpClick}>
					<UpOutlined />
				</Button>

				<Button onClick={handleDownClick}>
					<DownOutlined />
				</Button>
			</Space.Compact>
		</Flex>
	);
};

export default PinnedBar;

