import { CommonModule } from "@angular/common";
import { Component, OnDestroy } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { ApiService } from "../../shared/services/api/api.service";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { AvatarModule } from "primeng/avatar";
import { UserMediaService } from "../../shared/services/userMedia/user-media.service";
import { PlayerComponent } from "../../widgets/player/player.component";
import { ControlPanelComponent } from "../../widgets/control-panel/control-panel.component";
import { Subscription } from "rxjs";

@Component({
	selector: "app-room",
	standalone: true,
	imports: [CommonModule, ButtonModule, ProgressSpinnerModule, AvatarModule, PlayerComponent, ControlPanelComponent],
	templateUrl: "./room.component.html",
	styleUrl: "./room.component.scss"
})
export class RoomComponent implements OnDestroy {
	userVideoSubscription?: Subscription;

	userVideo?: MediaStream;
	constructor(public userMediaService: UserMediaService, public api: ApiService) {
		this.userVideoSubscription = this.userMediaService.userVideo$.subscribe(stream => (this.userVideo = stream));
	}

	ngOnDestroy(): void {
		this.userVideoSubscription?.unsubscribe()
	}
}
