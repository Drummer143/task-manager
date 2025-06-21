import React, { memo } from "react";

import {
	FullscreenExitOutlined,
	FullscreenOutlined,
	PauseOutlined as Pause,
	CaretRightFilled as Play
} from "@ant-design/icons";
import { Flex } from "antd";

import { useStyles } from "./styles";

interface ControlButtonsProps {
	onFullscreenToggle: () => void;
	paused: boolean;
	fullscreen: boolean;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
	onFullscreenToggle,
	paused,
	fullscreen
}) => {
	const styles = useStyles().styles;

	return (
		<Flex justify="space-between" align="center">
			{paused ? (
				<Play className={styles.playStateIcon} />
			) : (
				<Pause className={styles.playStateIcon} />
			)}

			{fullscreen ? (
				<FullscreenExitOutlined
					onClick={onFullscreenToggle}
					className={styles.playStateIcon}
				/>
			) : (
				<FullscreenOutlined onClick={onFullscreenToggle} className={styles.playStateIcon} />
			)}
		</Flex>
	);
};

export default memo(ControlButtons);
