import { useCallback, useRef, useState } from "react";

interface VideoPlayerState {
	fullscreen: boolean;
	isPaused: boolean;
	loading: boolean;
	duration: number;
}

interface ExtendedDivElement extends HTMLDivElement {
	webkitRequestFullscreen?: HTMLDivElement["requestFullscreen"];
	mozRequestFullScreen?: HTMLDivElement["requestFullscreen"];
	msRequestFullscreen?: HTMLDivElement["requestFullscreen"];
}

export const useControlHandlers = (loop?: boolean) => {
	const [state, setState] = useState<VideoPlayerState>({
		fullscreen: false,
		isPaused: true,
		loading: true,
		duration: 0
	});
	const [sliderValue, setSliderValue] = useState(0);

	const isDragging = useRef(false);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const videoContainerRef = useRef<ExtendedDivElement | null>(null);

	const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = useCallback(e => {
		if (!e.currentTarget.isSameNode(e.target as Node)) {
			return;
		}

		const isPaused = videoRef.current?.paused || videoRef.current?.ended;

		if (isPaused) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}

		setState(prev => ({
			...prev,
			isPaused: !isPaused
		}));
	}, []);

	const handleLoadedMetadata: React.ReactEventHandler<HTMLVideoElement> = useCallback(e => {
		setState(prev => ({
			...prev,
			loading: false,
			duration: (e.target as HTMLVideoElement).duration || 0
		}));
	}, []);

	const handleLoadStart: React.ReactEventHandler<HTMLVideoElement> = useCallback(() => {
		setState(prev => ({
			...prev,
			loading: true
		}));
	}, []);

	const handleTimeUpdate: React.ReactEventHandler<HTMLVideoElement> = useCallback(e => {
		if (!isDragging.current) {
			setSliderValue((e.target as HTMLVideoElement)?.currentTime || 0);
		}
	}, []);

	const handleEnded: React.ReactEventHandler<HTMLVideoElement> = useCallback(() => {
		if (loop) {
			videoRef.current?.play();
		} else {
			setState(prev => ({ ...prev, isPaused: true }));
		}
	}, [loop]);

	const handleDurationChange: React.ReactEventHandler<HTMLVideoElement> = useCallback(e => {
		setState(prev => ({
			...prev,
			duration: (e.target as HTMLVideoElement).duration || 0
		}));
	}, []);

	const handleFullscreen = useCallback(() => {
		const isFullscreen =
			document.fullscreenElement?.isSameNode(videoContainerRef.current) || false;

		if (isFullscreen) {
			document.exitFullscreen();
		} else {
			const videoContainer = videoContainerRef.current;

			const requestFullscreen: HTMLVideoElement["requestFullscreen"] | undefined =
				videoContainer?.requestFullscreen?.bind(videoContainer) ||
				videoContainer?.webkitRequestFullscreen?.bind(videoContainer) ||
				videoContainer?.mozRequestFullScreen?.bind(videoContainer) ||
				videoContainer?.msRequestFullscreen?.bind(videoContainer);

			requestFullscreen?.();
		}

		setState(prev => ({ ...prev, fullscreen: !isFullscreen }));
	}, []);

	const handleKeyDown: React.KeyboardEventHandler<HTMLVideoElement> = useCallback(e => {
		let isConsumed = false;
		const isPaused = videoRef.current?.paused || videoRef.current?.ended;

		switch (e.code) {
			case "Space":
				if (isPaused) {
					videoRef.current?.play();
				} else {
					videoRef.current?.pause();
				}

				setState(prev => ({ ...prev, isPaused: !isPaused }));

				isConsumed = true;
				break;
			case "KeyF":
				handleFullscreen();

				isConsumed = true;
				break;
			case "ArrowLeft":
				if (!videoRef.current) {
					return;
				}

				videoRef.current.pause();
				videoRef.current.currentTime -= 5;
				if (!isPaused) {
					videoRef.current.play();
				}

				isConsumed = true;
				break;
			case "ArrowRight":
				if (!videoRef.current) {
					return;
				}

				videoRef.current.pause();
				videoRef.current.currentTime += 5;
				if (!isPaused) {
					videoRef.current.play();
				}

				isConsumed = true;
				break;
		}

		if (isConsumed) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, []);

	const onSliderChangeComplete = useCallback((value: number) => {
		if (!videoRef.current) {
			return;
		}

		videoRef.current.currentTime = value;
		setSliderValue(value);

		setState(prev => ({
			...prev,
			isPaused: false
		}));
		isDragging.current = false;
		videoRef.current.play();
	}, []);

	const onSliderFocus = useCallback(() => {
		videoRef.current?.pause();
		isDragging.current = true;
		setState(prev => ({ ...prev, isPaused: true }));
	}, []);

	return {
		state,
		sliderValue,
		videoRef,
		videoContainerRef,
		handleOverlayClick,
		handleLoadedMetadata,
		handleLoadStart,
		handleTimeUpdate,
		handleEnded,
		handleDurationChange,
		handleFullscreen,
		handleKeyDown,
		onSliderChangeComplete,
		onSliderFocus,
		onSliderChange: setSliderValue
	};
};

