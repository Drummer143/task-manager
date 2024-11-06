import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { ApiService } from "../../shared/services/api/api.service";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AvatarModule } from "primeng/avatar";
import { UserMediaService } from "../../shared/services/userMedia/user-media.service";

@Component({
	selector: "page-room",
	standalone: true,
	imports: [CommonModule, ButtonModule, ProgressSpinnerModule, AvatarModule],
	templateUrl: "./room.component.html",
	styleUrl: "./room.component.scss"
})
export class RoomComponent implements AfterViewInit, OnDestroy {
	videoState: "off" | "loading" | "on" = "off";

	@ViewChild("userVideo") userVideo!: ElementRef<HTMLVideoElement>;

	constructor(private userMediaService: UserMediaService, public api: ApiService) {}

	ngAfterViewInit() {
		this.userVideo.nativeElement.addEventListener("loadeddata", () => (this.videoState = "on"));

		this.userMediaService.listenPermissionChange();
		this.getStream();
	}

	ngOnDestroy() {
		this.userMediaService.stopAll();

		this.userMediaService.unsubscribePermissionChange?.();
	}

	getStream() {
		this.videoState = "loading";
		this.userMediaService.getUserMedia().then(media => {
			if (this.userVideo.nativeElement && media) {
				this.userVideo.nativeElement.srcObject = media;
			}
		});
	}

	onCameraToggleClick() {
		if (this.videoState === "on") {
			this.userMediaService.stopCamera();
			this.videoState = "off";
		} else if (this.videoState === "off") {
			this.getStream();
		}
	}
}
