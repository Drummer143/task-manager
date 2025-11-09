import { proxy } from "valtio";

import { MessageListItem } from "./types";

export const INITIAL_LIMIT = 30;
export const LOAD_MORE_LIMIT = 10;
export const INITIAL_MAX_ITEMS = 1_000_000;

interface ChatStore {
	ctxOpen: boolean;
	firstItemIndex: number;
	listInfo: {
		items: MessageListItem[];
		groupCounts: number[];
		groupLabels: string[];
	};

	edit?: {
		text?: string;
		messageId: string;
	};
	ctxItemId?: string;
	replayMessage?: {
		id: string;
		text: string;
		senderName: string;
	};
	highlightedItemId?: string;
	highlightedViewed?: true;
	highlightedTimeoutId?: NodeJS.Timeout;
	scrollToItemId?: string;
}

export const chatStore = proxy<ChatStore>({
	ctxOpen: false,
	firstItemIndex: INITIAL_MAX_ITEMS - INITIAL_LIMIT,
	listInfo: {
		items: [],
		groupCounts: [],
		groupLabels: []
	}
});

