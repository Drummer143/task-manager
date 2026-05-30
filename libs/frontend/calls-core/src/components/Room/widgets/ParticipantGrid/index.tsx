import React, { useEffect, useMemo } from "react";

import {
	CarouselLayout,
	FocusLayout,
	FocusLayoutContainer,
	GridLayout,
	ParticipantTile,
	useLayoutContext,
	usePinnedTracks,
	useTracks
} from "@livekit/components-react";
import { Track } from "livekit-client";

import { useStyles } from "./styles";

const ParticipantGrid: React.FC = () => {
	const styles = useStyles().styles;

	// Camera tracks with placeholders — keeps a tile for participants whose
	// camera is off (rendered as avatar by ParticipantTile).
	// ScreenShare only appears while actively shared.
	const trackRefs = useTracks(
		[
			{ source: Track.Source.Camera, withPlaceholder: true },
			{ source: Track.Source.ScreenShare, withPlaceholder: false }
		],
		{ onlySubscribed: false }
	);

	const layoutContext = useLayoutContext();
	const pinned = usePinnedTracks() ?? [];
	const focusedTrack = pinned[0];

	// Auto-pin / auto-unpin screen-share — behaviour that `<VideoConference />`
	// implements internally and that we have to reproduce in custom UI.
	const screenShareTracks = useMemo(
		() => trackRefs.filter(t => t.source === Track.Source.ScreenShare),
		[trackRefs]
	);

	useEffect(() => {
		const someoneIsSharing = screenShareTracks.length > 0;
		const pinnedIsScreenShare = focusedTrack?.source === Track.Source.ScreenShare;

		// Someone (incl. me) started sharing and nothing is pinned — pin the share.
		if (someoneIsSharing && !focusedTrack) {
			layoutContext.pin.dispatch?.({
				msg: "set_pin",
				trackReference: screenShareTracks[0]
			});
			return;
		}

		// Sharing ended but pin still points to a now-stale screen-share — clear it.
		if (pinnedIsScreenShare && !someoneIsSharing) {
			layoutContext.pin.dispatch?.({ msg: "clear_pin" });
		}
	}, [screenShareTracks, focusedTrack, layoutContext]);

	if (focusedTrack) {
		const carouselTracks = trackRefs.filter(
			t =>
				t.participant.identity !== focusedTrack.participant.identity ||
				t.source !== focusedTrack.source
		);

		return (
			<div className={styles.focusLayout}>
				<FocusLayoutContainer>
					<CarouselLayout tracks={carouselTracks} orientation="vertical">
						<ParticipantTile />
					</CarouselLayout>

					<FocusLayout trackRef={focusedTrack} />
				</FocusLayoutContainer>
			</div>
		);
	}

	return (
		<div className={styles.gridContainer}>
			<GridLayout tracks={trackRefs}>
				<ParticipantTile />
			</GridLayout>
		</div>
	);
};

export default ParticipantGrid;
