import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
	providedIn: "root"
})
export class UserMediaService {
	muted = false;

	private camerasSubject = new BehaviorSubject<MediaDeviceInfo[]>([]);
	private userVideoSubject = new BehaviorSubject<MediaStream | undefined>(undefined);

	cameras$ = this.camerasSubject.asObservable();
	userVideo$ = this.userVideoSubject.asObservable();
	videoPlaying = false;
	cameraAllowed = true;
	private unsubscribeFuncs: (() => void)[] = [];

	constructor() {}

	private async listenPermissionChange() {
		if (!window.navigator?.permissions?.query) {
			return;
		}

		const permission = await navigator.permissions.query({ name: "camera" as PermissionName });

		const handlePermissionChange = (event: Event) => {
			if ((event.target as PermissionStatus).state !== "granted") {
				this.stopCamera();
			}

			if ((event.target as PermissionStatus).state === "prompt") {
				setTimeout(() => this.getUserVideo());
			}
		};

		permission.addEventListener("change", handlePermissionChange);

		this.unsubscribeFuncs?.push(() => permission.removeEventListener("change", handlePermissionChange));
	}

	async checkDevices() {
		if (!this.cameraAllowed) {
			return;
		}

		try {
			const newCameras: MediaDeviceInfo[] = [];

			const deviceList = await window.navigator.mediaDevices.enumerateDevices();

			for (let i = 0; i < deviceList.length; i++) {
				if (this.cameraAllowed && deviceList[i].kind === "videoinput") {
					newCameras.push(deviceList[i]);
					// } else if (mediaDevices[i].kind === "audioinput") {
					// 	microphone = mediaDevices[i];
				}
			}

			this.camerasSubject.next(newCameras);
		} catch (error) {
			console.error("Error accessing user media:", error);
		}
	}

	private listenDeviceChange() {
		const handleDeviceChange = async () => await this.checkDevices();

		window.navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

		this.unsubscribeFuncs?.push(() =>
			window.navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange)
		);
	}

	async getUserVideo(
		targetCamera?: string
	): Promise<MediaStream | void | "NotAllowedError" | "NotFoundError" | "AbortError" | "UnknownError"> {
		if (this.videoPlaying || !window.navigator?.mediaDevices?.getUserMedia) {
			return;
		}

		let userVideo: MediaStream | undefined;

		try {
			const targetDeviceId = this.camerasSubject.getValue().find(c => c.label === targetCamera)?.label;
			userVideo = await navigator.mediaDevices.getUserMedia({ video: { deviceId: targetDeviceId } });
			const track = userVideo.getVideoTracks()[0];
			const stopCameraOnEnd = () => this.stopCamera();

			track.addEventListener("ended", stopCameraOnEnd);

			this.unsubscribeFuncs?.push(() => track.removeEventListener("ended", stopCameraOnEnd));

			this.userVideoSubject.next(userVideo);
			this.videoPlaying = true;
			this.cameraAllowed = true;

			return userVideo;
		} catch (error) {
			if (!(error instanceof Error)) {
				return console.error("UNHANDLED ERROR:", { error });
			}

			if (["NotAllowedError", "NotFoundError", "AbortError"].includes(error.name)) {
				this.cameraAllowed = error.name !== "NotAllowedError";

				return error.name as "NotAllowedError" | "NotFoundError" | "AbortError";
			}

			this.cameraAllowed = true;

			console.error("UNHANDLED ERROR:", { error });

			return "UnknownError";
		}
	}

	async init() {
		await this.listenPermissionChange();
		this.listenDeviceChange();
	}

	stopCamera() {
		const currentVideo = this.userVideoSubject.getValue();
		if (currentVideo) {
			currentVideo.getTracks().forEach(track => track.stop());
			this.videoPlaying = false;
		}
	}

	cleanup() {
		while (this.unsubscribeFuncs.length) {
			this.unsubscribeFuncs.pop()?.();
		}
	}
}
