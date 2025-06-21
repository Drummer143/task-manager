import React, { memo } from "react";

import { NodeViewWrapper } from "@tiptap/react";
import { Flex, MenuProps, Spin } from "antd";

import Controls from "./Controls";
import OptionsMenu from "./OptionsMenu";
import { useStyles } from "./styles";
import { useControlHandlers } from "./useControlHandlers";

interface VideoPlayerProps {
	src?: string;
	loop?: boolean;
	controls?: boolean;
	// muted?: boolean;
	// autoPlay?: boolean;
	// playbackSpeed?: number;
	options?: MenuProps["items"];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, loop, controls, options }) => {
	const {
		state,
		handleOverlayClick,
		handleLoadStart,
		handleTimeUpdate,
		handleLoadedMetadata,
		handleEnded,
		handleDurationChange,
		handleFullscreen,
		handleKeyDown,
		onSliderChangeComplete,
		onSliderFocus,
		onSliderChange,
		sliderValue,
		videoRef,
		videoContainerRef
	} = useControlHandlers(loop);

	const styles = useStyles({ loading: state.loading }).styles;

	return (
		<NodeViewWrapper
			className={styles.wrapper}
			ref={videoContainerRef}
			tabIndex={1}
			onKeyDown={handleKeyDown}
		>
			<video
				className={styles.video}
				ref={videoRef}
				onLoadStart={handleLoadStart}
				onTimeUpdate={handleTimeUpdate}
				onLoadedData={handleLoadedMetadata}
				onEnded={handleEnded}
				onDurationChange={handleDurationChange}
				src={src}
				width="100%"
				height="auto"
				controls={false}
			/>

			<div
				className={styles.overlay}
				onClick={handleOverlayClick}
			>
				{state.loading ? (
					<Flex justify="center" align="center" className={styles.loaderWrapper}>
						<Spin size="large" />
					</Flex>
				) : (
					controls && (
						<Controls
							onFullscreenToggle={handleFullscreen}
							onSliderChangeComplete={onSliderChangeComplete}
							onSliderFocus={onSliderFocus}
							onSliderChange={onSliderChange}
							sliderValue={sliderValue}
							duration={state.duration}
							fullscreen={state.fullscreen}
							paused={state.isPaused}
						/>
					)
				)}
			</div>

			{options?.length && <OptionsMenu options={options} />}
		</NodeViewWrapper>
	);
};

export default memo(VideoPlayer);

