import React from "react";

import { LocalVideoTrack } from "livekit-client";

import { useStyles } from "./styles";

import { STATUS_MESSAGE } from "../../helpers";
import { DeviceStatus } from "../../types";

interface CameraPreviewProps {
	videoEnabled: boolean;
	camStatus: DeviceStatus;
	videoTrack: LocalVideoTrack | null;
	videoRef: React.RefObject<HTMLVideoElement | null>;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
	camStatus,
	videoEnabled,
	videoTrack,
	videoRef
}) => {
	const styles = useStyles().styles;

	return (
		<div className={styles.videoContainer}>
			{videoEnabled && camStatus === "ok" && videoTrack ? (
				<video muted autoPlay playsInline ref={videoRef} className={styles.video} />
			) : !videoEnabled ? (
				<span>Camera is off</span>
			) : camStatus !== "ok" ? (
				<span>{STATUS_MESSAGE[camStatus].camera}</span>
			) : (
				<span>Connecting to camera…</span>
			)}
		</div>
	);
};

export default CameraPreview;

