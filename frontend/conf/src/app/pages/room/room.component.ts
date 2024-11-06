import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { ApiService } from "../../shared/services/api/api.service";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AvatarModule } from "primeng/avatar";
import { UserMediaService } from "../../shared/services/userVideo/user-media.service";
import { PlayerComponent } from "../../widgets/player/player.component";

@Component({
	selector: "page-room",
	standalone: true,
	imports: [CommonModule, ButtonModule, ProgressSpinnerModule, AvatarModule, PlayerComponent],
	templateUrl: "./room.component.html",
	styleUrl: "./room.component.scss"
})
export class RoomComponent implements AfterViewInit, OnDestroy {
	media: MediaStream | undefined;

	constructor(public userMediaService: UserMediaService, public api: ApiService) {}

	ngAfterViewInit() {
		this.userMediaService.listenPermissionChange();
		this.getStream();
	}

	ngOnDestroy() {
		this.userMediaService.stopAll();

		this.userMediaService.unsubscribePermissionChange?.();
	}

	getStream() {
		this.userMediaService.getUserMedia().then(media => {
			this.media = media;
		});
	}

	onCameraToggleClick() {
		if (this.media) {
			this.userMediaService.stopCamera();
			this.media = undefined;
		} else {
			this.getStream();
		}
	}
}
