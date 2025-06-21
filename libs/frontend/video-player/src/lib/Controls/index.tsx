import React from "react";

import { Slider } from "antd";

import ControlButtons from "./ControlButtons";
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

			<ControlButtons
				onFullscreenToggle={onFullscreenToggle}
				paused={paused}
				fullscreen={fullscreen}
			/>
		</div>
	);
};

export default Controls;

