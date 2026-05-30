import React from "react";

import {
	LayoutContextProvider,
	RoomAudioRenderer,
	StartAudio
} from "@livekit/components-react";
import { Flex } from "antd";

import ControlsBar from "./widgets/ControlsBar";
import Header from "./widgets/Header";
import ParticipantGrid from "./widgets/ParticipantGrid";
import ReconnectingBanner from "./widgets/ReconnectingBanner";

const MeetingShell: React.FC = () => {
	return (
		// LayoutContextProvider is required for `usePinnedTracks`, `FocusLayout`,
		// `CarouselLayout` — anything that reads/writes pin/widget state.
		// <LiveKitRoom> only provides RoomContext, layout context is separate.
		<LayoutContextProvider>
			<Flex vertical style={{ height: "100%", overflow: "hidden" }}>
				{/* Required: plays all subscribed remote audio tracks. Without it
				    the call is silent. */}
				<RoomAudioRenderer />

				{/* Browser autoplay policy may block audio until first user
				    gesture. StartAudio renders a button when needed and removes
				    itself after. */}
				<StartAudio label="Click to enable audio" />

				<Header />
				<ReconnectingBanner />

				<Flex vertical style={{ flex: 1, minHeight: 0 }}>
					<ParticipantGrid />
				</Flex>

				<ControlsBar />
			</Flex>
		</LayoutContextProvider>
	);
};

export default MeetingShell;
