export type Handler<T> = (payload: T) => void;

export class Emitter<Events extends Record<string, unknown>> {
	private listeners = new Map<keyof Events, Set<Handler<unknown>>>();

	on<K extends keyof Events>(event: K, handler: Handler<Events[K]>) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const set = this.listeners.get(event)!;

		set.add(handler as Handler<unknown>);

		return () => set.delete(handler as Handler<unknown>);
	}

	off<K extends keyof Events>(event: K, handler: Handler<Events[K]>) {
		this.listeners.get(event)?.delete(handler as Handler<unknown>);
	}

	emit<K extends keyof Events>(event: K, payload: Events[K]) {
		const set = this.listeners.get(event);

		if (!set) return;

		for (const handler of [...set]) {
			handler(payload);
		}
	}
}
