import React from "react";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

import { OnJoinCompleteParams } from "../PreJoin/types";

type RoomProps = OnJoinCompleteParams;

const Room: React.FC<RoomProps> = props => {
	return (
		<div data-lk-theme="default" style={{ height: "100vh" }}>
			<LiveKitRoom
				token={props.token}
				serverUrl={props.serverUrl}
				connect
				video={props.videoEnabled}
				audio={props.audioEnabled}
				onError={e => console.error("LiveKit error:", e)}
				onDisconnected={() => console.log("disconnected")}
			>
				<VideoConference />
			</LiveKitRoom>
		</div>
	);
};

export default Room;

