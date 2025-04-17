declare global {
	const appConfig: AppConfig;

	interface CreateTaskEventDetail {
		status: TaskStatus;
	}

	interface CustomEventMap {
		createTask: CustomEvent<CreateTaskEventDetail>;
	}

	type MergedEventMap = CustomEventMap & DocumentEventMap;

	interface Document {
		addEventListener<T extends keyof MergedEventMap>(
			event: T,
			handler: (this: Document, e: MergedEventMap[T]) => void,
			options?: boolean | AddEventListenerOptions
		);

		removeEventListener<T extends keyof MergedEventMap>(
			type: T,
			listener: (this: Document, e: MergedEventMap[T]) => void,
			options?: boolean | EventListenerOptions
		);

		dispatchEvent<T extends keyof MergedEventMap>(e: MergedEventMap[T]);
	}

	interface HTMLDivElement {
		addEventListener<T extends keyof MergedEventMap>(
			event: T,
			handler: (this: Document, e: MergedEventMap[T]) => void,
			options?: boolean | AddEventListenerOptions
		);

		removeEventListener<T extends keyof MergedEventMap>(
			type: T,
			listener: (this: Document, e: MergedEventMap[T]) => void,
			options?: boolean | EventListenerOptions
		);

		dispatchEvent<T extends keyof MergedEventMap>(e: MergedEventMap[T]);
	}

	type DocumentEventHandler<T extends keyof MergedEventMap = MergedEventMap> = (event: MergedEventMap[T]) => void;
}

export {};