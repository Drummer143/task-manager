import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root"
})
export class UserMediaService {
	userMedia?: MediaStream;
	unsubscribePermissionChange?: () => void;

	constructor() {}

	async getUserMedia() {
		if (!window.navigator?.mediaDevices?.getUserMedia) {
			return;
		}

		this.userMedia = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

		return this.userMedia;
	}

	async listenPermissionChange() {
		if (!window.navigator?.permissions?.query) {
			return;
		}

		const handlePermissionChange = (event: Event) => {
			if ((event.target as PermissionStatus).state !== "granted") {
				this.stopCamera();
			}

			if ((event.target as PermissionStatus).state === "prompt") {
				setTimeout(() => this.getUserMedia());
			}
		};

		const permission = await navigator.permissions.query({ name: "camera" as PermissionName });

		permission.addEventListener("change", handlePermissionChange);

		this.unsubscribePermissionChange = () => permission.removeEventListener("change", handlePermissionChange);
	}

	stopCamera() {
		this.userMedia?.getVideoTracks().forEach(track => track.stop());
	}

	stopAll() {
		this.userMedia?.getTracks().forEach(track => track.stop());
	}
}
