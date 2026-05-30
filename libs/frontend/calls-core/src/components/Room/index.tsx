import React, { useCallback, useMemo } from "react";

import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { DisconnectReason, RoomOptions } from "livekit-client";

import MeetingShell from "./MeetingShell";
import { useStyles } from "./styles";

import { OnJoinCompleteParams } from "../PreJoin/types";

export interface RoomProps extends OnJoinCompleteParams {
	/**
	 * Called when the participant leaves or is disconnected by the server.
	 * Use this to navigate back (e.g. to `/` or PreJoin) or to surface a toast.
	 */
	onLeave?: (reason?: DisconnectReason) => void;

	/** Fires on any non-fatal LiveKit error. Override default `console.error`. */
	onError?: (error: Error) => void;
}

const Room: React.FC<RoomProps> = props => {
	const styles = useStyles().styles;

	// IMPORTANT: stable references prevent <LiveKitRoom> from re-creating its
	// internal Room instance on every render.
	const roomOptions = useMemo<RoomOptions>(
		() => ({
			adaptiveStream: true,
			dynacast: true,
			audioCaptureDefaults: props.micId ? { deviceId: props.micId } : undefined,
			videoCaptureDefaults: props.camId ? { deviceId: props.camId } : undefined
		}),
		[props.micId, props.camId]
	);

	const handleDisconnected = useCallback(
		(reason?: DisconnectReason) => {
			props.onLeave?.(reason);
		},
		[props.onLeave]
	);

	const handleError = useCallback(
		(error: Error) => {
			if (props.onError) {
				props.onError(error);
			} else {
				console.error("LiveKit error:", error);
			}
		},
		[props.onError]
	);

	return (
		<div data-lk-theme="default" className={styles.root}>
			<LiveKitRoom
				token={props.token}
				serverUrl={props.serverUrl}
				connect
				video={props.videoEnabled}
				audio={props.audioEnabled}
				options={roomOptions}
				onError={handleError}
				onDisconnected={handleDisconnected}
			>
				<MeetingShell />
			</LiveKitRoom>
		</div>
	);
};

export default Room;
