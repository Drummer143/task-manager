export type DeviceStatus = "ok" | "no-device" | "denied" | "in-use" | "error";

export interface OnJoinCompleteParams {
	videoEnabled: boolean;
	audioEnabled: boolean;

	micId?: string;
	camId?: string;

	token: string;
	serverUrl: string;
}
