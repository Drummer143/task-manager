import { Injectable } from "@angular/core";
import { Presence } from "phoenix";
import type { Channel } from "phoenix";

export interface PresenceMeta {
	typing?: boolean;
	username?: string;
	avatar?: string;
	[key: string]: unknown;
}

export interface RawPresenceInfo {
	[userId: string]: { metas: PresenceMeta[] };
}

@Injectable({ providedIn: "root" })
export class PresenceService {
	syncState(current: RawPresenceInfo, state: unknown): RawPresenceInfo {
		return Presence.syncState(current as never, state as never) as unknown as RawPresenceInfo;
	}

	syncDiff(current: RawPresenceInfo, diff: unknown): RawPresenceInfo {
		return Presence.syncDiff(current as never, diff as never) as unknown as RawPresenceInfo;
	}

	trackPresence(
		channel: Channel,
		onUpdate: (presences: RawPresenceInfo) => void
	): void {
		let presences: RawPresenceInfo = {};

		channel.on("presence_state", state => {
			presences = this.syncState(presences, state);
			onUpdate(presences);
		});

		channel.on("presence_diff", diff => {
			presences = this.syncDiff(presences, diff);
			onUpdate(presences);
		});
	}
}
