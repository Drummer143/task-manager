import React from "react";

import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

interface RoomProps {
	token: string;
	serverUrl: string;
}

const Room: React.FC<RoomProps> = props => {
	return (
		<div data-lk-theme="default" style={{ height: "100vh" }}>
			<LiveKitRoom
				token={props.token}
				serverUrl={props.serverUrl}
				connect
				video={false}
				audio
				onError={e => console.error("LiveKit error:", e)}
				onDisconnected={() => console.log("disconnected")}
			>
				<VideoConference />
			</LiveKitRoom>
		</div>
	);
};

export default Room;

