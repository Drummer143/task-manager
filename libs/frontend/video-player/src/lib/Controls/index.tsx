import React, { memo } from "react";

import {
	FullscreenExitOutlined,
	FullscreenOutlined,
	PauseOutlined as Pause,
	CaretRightFilled as Play
} from "@ant-design/icons";
import { Flex, Slider } from "antd";

import { useStyles } from "./styles";

interface ControlsProps {
	onFullscreenToggle: () => void;
	onSliderChangeComplete?: (value: number) => void;
	onSliderFocus?: () => void;
	onSliderChange?: (value: number) => void;
	sliderValue: number;
	fullscreen: boolean;
	duration: number;
	paused: boolean;
}

const Controls: React.FC<ControlsProps> = ({
	onFullscreenToggle,
	onSliderChangeComplete,
	onSliderFocus,
	onSliderChange,
	sliderValue,
	duration,
	fullscreen,
	paused
}) => {
	const styles = useStyles().styles;

	return (
		<div className={styles.controls}>
			<Slider
				onFocus={onSliderFocus}
				step={0.001}
				keyboard
				tooltip={{ open: false }}
				onChange={onSliderChange}
				value={sliderValue}
				onChangeComplete={onSliderChangeComplete}
				max={duration}
			/>

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
					<FullscreenOutlined
						onClick={onFullscreenToggle}
						className={styles.playStateIcon}
					/>
				)}
			</Flex>
		</div>
	);
};

export default memo(Controls);

