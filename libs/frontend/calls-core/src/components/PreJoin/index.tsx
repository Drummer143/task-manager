import React, { useCallback, useEffect, useRef, useState } from "react";

import { useMediaDevices } from "@livekit/components-react";
import "@livekit/components-styles";
import { Flex } from "antd";
import {
	createAudioAnalyser,
	createLocalAudioTrack,
	createLocalVideoTrack,
	LocalAudioTrack,
	LocalVideoTrack
} from "livekit-client";

import { classifyMediaError } from "./helpers";
import { DeviceStatus, OnJoinCompleteParams } from "./types";
import CameraPreview from "./widgets/CameraPreview";
import DeviceSelects from "./widgets/DeviceSelects";
import RoomInfo from "./widgets/RoomInfo";

import { useDevicePrefs } from "../../store/devicePrefs";

interface PreJoinProps {
	onJoinComplete: (params: OnJoinCompleteParams) => void;
}

const PreJoin: React.FC<PreJoinProps> = ({ onJoinComplete }) => {
	const [audioEnabled, setAudioEnabled] = useState(true);
	const [videoEnabled, setVideoEnabled] = useState(true);
	const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
	const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
	const [volume, setVolume] = useState(0);
	const [camStatus, setCamStatus] = useState<DeviceStatus>("ok");
	const [micStatus, setMicStatus] = useState<DeviceStatus>("ok");

	const { micId, camId, setMicId, setCamId } = useDevicePrefs();

	const videoRef = useRef<HTMLVideoElement>(null);

	const handleError = useCallback((error: Error) => {
		console.error("Error getting media devices:", error);
	}, []);

	const cams = useMediaDevices({ kind: "videoinput", onError: handleError });
	const mics = useMediaDevices({ kind: "audioinput", onError: handleError });

	const handleJoinComplete = useCallback(
		(params: Pick<OnJoinCompleteParams, "token" | "serverUrl">) => {
			onJoinComplete({
				...params,
				audioEnabled,
				camId,
				micId,
				videoEnabled
			});
		},
		[onJoinComplete, audioEnabled, camId, micId, videoEnabled]
	);

	useEffect(() => {
		if (!camId && cams.length) setCamId(cams[0].deviceId);
	}, [cams, camId, setCamId]);

	useEffect(() => {
		if (!micId && mics.length) setMicId(mics[0].deviceId);
	}, [mics, micId, setMicId]);

	useEffect(() => {
		if (!videoEnabled) {
			setVideoTrack(null);
			return;
		}

		let cancelled = false;
		let track: LocalVideoTrack | undefined;

		const tryCreate = async (): Promise<LocalVideoTrack> => {
			try {
				return await createLocalVideoTrack(
					camId ? { deviceId: { exact: camId } } : undefined
				);
			} catch (err) {
				console.warn("requested camera not available, falling back:", err);
				if (camId) setCamId(undefined);
				return await createLocalVideoTrack();
			}
		};

		tryCreate()
			.then(t => {
				if (cancelled) {
					t.stop();
					return;
				}
				track = t;
				setVideoTrack(t);
				setCamStatus("ok");
			})
			.catch(e => {
				console.error("camera error:", e);
				setCamStatus(classifyMediaError(e));
				setVideoTrack(null);
			});

		return () => {
			cancelled = true;
			track?.stop();
			setVideoTrack(null);
		};
	}, [videoEnabled, camId, setCamId]);

	useEffect(() => {
		if (!audioEnabled) {
			setAudioTrack(null);
			return;
		}

		let cancelled = false;
		let track: LocalAudioTrack | undefined;

		const tryCreate = async (): Promise<LocalAudioTrack> => {
			try {
				return await createLocalAudioTrack(
					micId ? { deviceId: { exact: micId } } : undefined
				);
			} catch (err) {
				console.warn("requested mic not available, falling back:", err);
				if (micId) setMicId(undefined);
				return await createLocalAudioTrack();
			}
		};

		tryCreate()
			.then(t => {
				if (cancelled) {
					t.stop();
					return;
				}
				track = t;
				setAudioTrack(t);
				setMicStatus("ok");
			})
			.catch(e => {
				console.error("mic error:", e);
				setMicStatus(classifyMediaError(e));
				setAudioTrack(null);
			});

		return () => {
			cancelled = true;
			track?.stop();
			setAudioTrack(null);
		};
	}, [audioEnabled, micId, setMicId]);

	useEffect(() => {
		if (videoEnabled && cams.length === 0) setCamStatus("no-device");
	}, [cams, videoEnabled]);

	useEffect(() => {
		if (audioEnabled && mics.length === 0) setMicStatus("no-device");
	}, [mics, audioEnabled]);

	useEffect(() => {
		if (videoTrack && videoRef.current) {
			videoTrack.attach(videoRef.current);

			return () => {
				videoTrack.detach();
			};
		}
	}, [videoTrack]);

	useEffect(() => {
		if (!audioTrack) {
			setVolume(0);
			return;
		}
		const { calculateVolume, cleanup } = createAudioAnalyser(audioTrack);
		let raf = 0;

		const loop = () => {
			setVolume(calculateVolume());
			raf = requestAnimationFrame(loop);
		};

		loop();
		return () => {
			cancelAnimationFrame(raf);
			cleanup();
		};
	}, [audioTrack]);

	return (
		<Flex
			vertical
			style={{ paddingTop: "var(--ant-padding-xl)", height: "100%", overflow: "hidden" }}
		>
			<Flex style={{ flex: 1 }}>
				<Flex align="center" justify="center" style={{ flex: 1 }}>
					<CameraPreview
						videoEnabled={videoEnabled}
						camStatus={camStatus}
						videoTrack={videoTrack}
						videoRef={videoRef}
					/>
				</Flex>

				<Flex align="center" justify="center" style={{ flex: 1 }}>
					<RoomInfo onJoinComplete={handleJoinComplete} />
				</Flex>
			</Flex>

			<Flex justify="center">
				<DeviceSelects
					cams={cams}
					mics={mics}
					micVolume={volume}
					micStatus={micStatus}
					camStatus={camStatus}
					videoEnabled={videoEnabled}
					audioEnabled={audioEnabled}
					setAudioEnabled={setAudioEnabled}
					setVideoEnabled={setVideoEnabled}
				/>
			</Flex>
		</Flex>
	);
};

export default PreJoin;

