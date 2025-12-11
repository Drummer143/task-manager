import { Emitter } from "./event-emitter";

describe("Emitter", () => {
	it("delivers events to listeners", () => {
		const emitter = new Emitter<{ test: string }>();
		let received: string | undefined;

		emitter.on("test", payload => {
			received = payload;
		});

		emitter.emit("test", "hello");

		expect(received).toBe("hello");
	});

	it("handles multiple listeners", () => {
		const emitter = new Emitter<{ test: string }>();
		let received1: string | undefined;
		let received2: string | undefined;

		emitter.on("test", payload => {
			received1 = payload;
		});
		emitter.on("test", payload => {
			received2 = payload;
		});

		emitter.emit("test", "hello");

		expect(received1).toBe("hello");
		expect(received2).toBe("hello");
	});

	it("handles different event types", () => {
		const emitter = new Emitter<{ string: string; numArray: number[] }>();
		let receivedString: string | undefined;
		let receivedNumArray: number[] | undefined;

		emitter.on("string", payload => {
			receivedString = payload;
		});
		emitter.on("numArray", payload => {
			receivedNumArray = payload;
		});

		emitter.emit("string", "hello");
		emitter.emit("numArray", [1, 2, 3]);

		expect(receivedString).toBe("hello");
		expect(receivedNumArray).toEqual([1, 2, 3]);
	});

	it("unsubscribe via Emitter.on return function works", () => {
		const emitter = new Emitter<{ test: string }>();
		let received: string | undefined;

		const unsubscribe = emitter.on("test", payload => {
			received = payload;
		});

		emitter.emit("test", "hello");
		expect(received).toBe("hello");

		unsubscribe();

		emitter.emit("test", "world");

		expect(received).toBe("hello");
	});

	it("unsubscribe via Emitter.off works", () => {
		const emitter = new Emitter<{ test: string }>();
		let received: string | undefined;

		const handler = (payload: string) => {
			received = payload;
		};

		emitter.on("test", handler);

		emitter.emit("test", "test");
		expect(received).toBe("test");

		emitter.off("test", handler);

		emitter.emit("test", "after removal");
		expect(received).toBe("test");
	});

	it("unsubscribe during iteration", () => {
		const emitter = new Emitter<{ test: string }>();
		let received: string | undefined = undefined;

		const unsubscribe = emitter.on("test", payload => {
			received = payload;
			unsubscribe();
		});

		emitter.emit("test", "hello");
		emitter.emit("test", "world");

		expect(received).toBe("hello");
	});
});

