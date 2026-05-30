export const queryKeys = {
	profile: {
		root: () => ["profile"] as const
	},
	rooms: {
		root: () => ["rooms"] as const,
		detail: (roomId: string) => ["rooms", roomId] as const
	}
};
