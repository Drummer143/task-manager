import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AudioOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { useMediaDevices } from "@livekit/components-react";
import "@livekit/components-styles";
import { Button, Flex, Select } from "antd";
import {
	createAudioAnalyser,
	createLocalAudioTrack,
	createLocalVideoTrack,
	LocalAudioTrack,
	LocalVideoTrack
} from "livekit-client";

import { useDevicePrefs } from "../../app/store/devicePrefs";

// "Microphone (FIFINE Microphone) (3142:7301)" -> "Microphone (FIFINE Microphone)"
// "Default - Speakers (Realtek)" -> "Speakers (Realtek)"
// "Communications - Microphone (USB Audio)" -> "Microphone (USB Audio)"
const cleanDeviceLabel = (label: string): string =>
	label
		.replace(/\s*\([0-9a-f]{4}:[0-9a-f]{4}\)\s*$/i, "")
		// .replace(/^(Default|Communications)\s*-\s*/i, "")
		.trim();

type DeviceStatus = "ok" | "no-device" | "denied" | "in-use" | "error";

const classifyMediaError = (err: unknown): DeviceStatus => {
	if (!(err instanceof Error)) return "error";
	switch (err.name) {
		case "NotFoundError":
		case "OverconstrainedError":
			return "no-device";
		case "NotAllowedError":
		case "SecurityError":
			return "denied";
		case "NotReadableError":
		case "AbortError":
			return "in-use";
		default:
			return "error";
	}
};

const STATUS_MESSAGE: Record<Exclude<DeviceStatus, "ok">, { camera: string; mic: string }> = {
	"no-device": {
		camera: "No camera detected. Please connect a device.",
		mic: "No microphone detected. Please connect a device."
	},
	denied: {
		camera: "Camera access denied. Allow it in your browser settings.",
		mic: "Microphone access denied. Allow it in your browser settings."
	},
	"in-use": {
		camera: "Camera is in use by another application.",
		mic: "Microphone is in use by another application."
	},
	error: {
		camera: "Failed to connect to the camera.",
		mic: "Failed to connect to the microphone."
	}
};

const PreJoin: React.FC = () => {
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

	const camOptions = useMemo(
		() =>
			cams.map(cam => ({
				label: cleanDeviceLabel(cam.label) || `Camera ${cam.deviceId.slice(0, 6)}`,
				value: cam.deviceId
			})),
		[cams]
	);

	const micOptions = useMemo(
		() =>
			mics.map(mic => ({
				label: cleanDeviceLabel(mic.label) || `Mic ${mic.deviceId.slice(0, 6)}`,
				value: mic.deviceId
			})),
		[mics]
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

	// Дополнительно: если useMediaDevices вернул пустой список — устройств нет физически
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
		<div>
			<h1>PreJoin</h1>

			<div
				style={{
					width: "400px",
					height: "225px",
					background: "#000",
					borderRadius: 8,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					color: "#aaa",
					textAlign: "center",
					padding: "0 16px"
				}}
			>
				{videoEnabled && camStatus === "ok" && videoTrack ? (
					<video
						muted
						autoPlay
						playsInline
						ref={videoRef}
						style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
					/>
				) : !videoEnabled ? (
					<span>Camera is off</span>
				) : camStatus !== "ok" ? (
					<span>{STATUS_MESSAGE[camStatus].camera}</span>
				) : (
					<span>Connecting to camera…</span>
				)}
			</div>

			{micStatus === "ok" ? (
				<div style={{ height: 8, background: "#222", borderRadius: 4, overflow: "hidden" }}>
					<div
						style={{
							width: `${Math.min(100, volume * 100)}%`,
							height: "100%",
							background: "#22c55e",
							transition: "width 80ms linear"
						}}
					/>
				</div>
			) : (
				<div style={{ color: "#ef4444", fontSize: 12 }}>{STATUS_MESSAGE[micStatus].mic}</div>
			)}

			<Flex gap="var(--ant-padding-sm)">
				<Select
					value={micId}
					onChange={setMicId}
					options={micOptions}
					placeholder="Microphone"
					disabled={micStatus === "no-device" || micStatus === "denied"}
					style={{ minWidth: 200 }}
				/>

				<Select
					value={camId}
					onChange={setCamId}
					options={camOptions}
					placeholder="Camera"
					disabled={camStatus === "no-device" || camStatus === "denied"}
					style={{ minWidth: 200 }}
				/>
			</Flex>

			<Flex gap="var(--ant-padding-sm)">
				<Button
					shape="round"
					type={audioEnabled ? "primary" : "default"}
					icon={<AudioOutlined />}
					disabled={micStatus === "no-device" || micStatus === "denied"}
					onClick={() => setAudioEnabled(prev => !prev)}
				/>

				<Button
					shape="round"
					type={videoEnabled ? "primary" : "default"}
					icon={<VideoCameraOutlined />}
					disabled={camStatus === "no-device" || camStatus === "denied"}
					onClick={() => setVideoEnabled(prev => !prev)}
				/>
			</Flex>
		</div>
	);
};

export default PreJoin;

