import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { PrimeNGConfig } from "primeng/api";
import { ButtonModule } from "primeng/button";

@Component({
	selector: "page-room",
	standalone: true,
	imports: [CommonModule, ButtonModule],
	templateUrl: "./room.component.html",
	styleUrl: "./room.component.scss"
})
export class RoomComponent implements AfterViewInit, OnDestroy {
	userMedia?: MediaStream;
	videoState: "off" | "loading" | "on" = "off";
	unsubscribePermissionChange?: () => void;

	@ViewChild("userVideo") userVideo!: ElementRef<HTMLVideoElement>;

	constructor() {}

	ngAfterViewInit() {
		this.userVideo.nativeElement.addEventListener("loadeddata", () => (this.videoState = "on"));

		this.getUserMedia();
		this.listenPermissionChange();
	}

	ngOnDestroy() {
		this.userMedia?.getTracks().forEach(track => track.stop());

		this.unsubscribePermissionChange?.();
	}

	getUserMedia() {
		if (!window.navigator?.mediaDevices?.getUserMedia) {
			return;
		}

		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(media => {
			this.videoState = "loading";
			this.userVideo.nativeElement.srcObject = media;
			this.userMedia = media;
		});
	}

	listenPermissionChange() {
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

		navigator.permissions.query({ name: "camera" as PermissionName }).then(permission => {
			permission.addEventListener("change", handlePermissionChange);

			this.unsubscribePermissionChange = () => permission.removeEventListener("change", handlePermissionChange);
		});
	}

	stopCamera() {
		this.userMedia?.getVideoTracks().forEach(track => track.stop());

		setTimeout(() => {
			if (this.userVideo) {
				this.userVideo.nativeElement.srcObject = null;
			}
		});

		this.videoState = "off";
	}

	onCameraToggleClick() {
		if (this.videoState === "on") {
			this.stopCamera();
		} else if (this.videoState === "off") {
			this.getUserMedia();
		}
	}
}
