import { create } from "zustand";

type SocketMessageRequest =
	| {
			type: "get-tasks";
	  }
	| {
			type: "get-task" | "delete-task";
			body: string;
	  }
	| {
			type: "create-task";
			body: {
				title: string;
				status: TaskStatus;

				dueDate?: string;
				assignedTo?: string;
				description?: string;
			};
	  }
	| {
			type: "change-status";
			body: {
				id: string;
				status: TaskStatus;
			};
	  }
	| {
		type: "update-task";
		body: {
			id: string;
			title?: string;
			dueDate?: string;
			assignedTo?: string;
			description?: string;
			status?: TaskStatus;
		}
	};

type SocketMessageResponse =
	| {
			type: "get-tasks";
			body: Record<TaskStatus, Task[]>;
	  }
	| {
			type: "get-task";
			body: Task;
	  }
	| {
			type: "create-task";
			body: Task;
	  }
	| {
			type: "change-status";
			body: {
				prevStatus: TaskStatus;
				task: Task;
			};
	  };

interface SocketStoreState {
	status: "connecting" | "opened" | "closed" | "errored";

	task?: Task;
	error?: Event;
	tasks?: Partial<Record<TaskStatus, Task[]>>;
	socket?: WebSocket;

	send: (data: SocketMessageRequest) => void;
	connect: () => WebSocket;
}

const queue: SocketMessageRequest[] = [];

export const useWebsocketStore = create<SocketStoreState>((set, get) => ({
	status: "closed" as const,

	connect: () => {
		if (get().status !== "closed") {
			return get().socket!;
		}

		set({ status: "connecting" });

		const socket = new WebSocket("ws://localhost:8080/tasks/socket");

		set({ socket });

		socket.onmessage = event => {
			try {
				const message = JSON.parse(event.data) as SocketMessageResponse;

				switch (message.type) {
					case "get-tasks":
						set({ tasks: message.body });
						break;
					case "create-task": {
						const tasks = get().tasks || ({} as Partial<Record<TaskStatus, Task[]>>);

						set({
							tasks: {
								...tasks,
								[message.body.status]: [...(tasks[message.body.status] || []), message.body]
							}
						});

						break;
					}
					case "change-status": {
						const tasks = get().tasks;
						const filtered =
							tasks?.[message.body.prevStatus]?.filter(task => task.id !== message.body.task.id) || [];

						set({
							tasks: {
								...tasks,
								[message.body.prevStatus]: filtered,
								[message.body.task.status]: [
									...(tasks?.[message.body.task.status] || []),
									message.body.task
								]
							}
						});

						break;
					}
					case "get-task":
						set({ task: message.body });
				}
			} catch {
				/* empty */
			}
		};

		socket.onopen = () => {
			set({ status: "opened" });

			while (queue.length) {
				get().send(queue.shift()!);
			}
		};

		socket.onclose = () => {
			set({ status: "closed", socket: undefined });
		};

		socket.onerror = error => {
			console.error("WebSocket error:", error);
			set({ status: "errored", socket: undefined, error });
		};

		return socket;
	},

	send: (data: SocketMessageRequest) => {
		const socket = get().socket;

		if (socket?.readyState !== WebSocket.OPEN) {
			return queue.push(data);
		}

		try {
			socket.send(JSON.stringify(data));
		} catch {
			/* empty */
		}
	}
}));
