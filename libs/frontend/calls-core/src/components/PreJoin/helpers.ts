import { DeviceStatus } from "./types";

export const classifyMediaError = (err: unknown): DeviceStatus => {
	if (!(err instanceof Error)) return "error";
	switch (err.name) {
		case "NotFoundError":
		case "OverconstrainedError":
			return "no-device";
		case "NotAllowedError":
		case "SecurityError":
			return "denied";
		case "NotReadableError":
		case "AbortError":
			return "in-use";
		default:
			return "error";
	}
};

export const STATUS_MESSAGE: Record<
	Exclude<DeviceStatus, "ok">,
	{ camera: string; mic: string }
> = {
	"no-device": {
		camera: "No camera detected. Please connect a device.",
		mic: "No microphone detected. Please connect a device."
	},
	denied: {
		camera: "Camera access denied. Allow it in your browser settings.",
		mic: "Microphone access denied. Allow it in your browser settings."
	},
	"in-use": {
		camera: "Camera is in use by another application.",
		mic: "Microphone is in use by another application."
	},
	error: {
		camera: "Failed to connect to the camera.",
		mic: "Failed to connect to the microphone."
	}
};
