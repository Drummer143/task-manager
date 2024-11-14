import { AfterViewInit, Component, DoCheck, Inject, OnChanges, OnDestroy } from "@angular/core";
import { UserMediaService } from "../../shared/services/userMedia/user-media.service";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { DialogModule } from "primeng/dialog";
import { DropdownChangeEvent, DropdownModule } from "primeng/dropdown";
import { CommonModule } from "@angular/common";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { FormsModule } from "@angular/forms";

@Component({
	selector: "app-control-panel",
	standalone: true,
	imports: [ButtonModule, CommonModule, TooltipModule, OverlayPanelModule, DropdownModule, FormsModule, DialogModule],
	templateUrl: "./control-panel.component.html",
	styleUrl: "./control-panel.component.scss"
})
export class ControlPanelComponent implements AfterViewInit, OnDestroy {
	private cameraSubscription?: Subscription;
	private selectedCameraSubscription?: Subscription;

	cameras: MediaDeviceInfo[] = [];
	selectedCamera?: string;
	errorDialogVisible = false;

	constructor(
		@Inject(UserMediaService) public userMediaService: UserMediaService,
		private messageService: MessageService
	) {}

	onCameraToggleClick() {
		if (this.userMediaService.videoPlaying) {
			this.userMediaService.stopCamera();
		} else {
			this.userMediaService.getUserVideo().then(
				result =>
					result === "NotAllowedError" &&
					this.messageService.add({
						severity: "error",
						closable: true,
						summary: "Error",
						detail: "Camera access is not allowed"
					})
			);
		}
	}

	onCameraChange(event: DropdownChangeEvent) {
		this.selectedCamera = event.value;
	}

	async ngAfterViewInit() {
		await this.userMediaService.init();
		const result = await this.userMediaService.getUserVideo();

		if (typeof result === "object") {
			await this.userMediaService.checkDevices();
		} else if (result === "AbortError" || result === "UnknownError") {
			this.errorDialogVisible = true;			
		}

		this.cameraSubscription = this.userMediaService.cameras$.subscribe(cameras => (this.cameras = cameras));

		this.selectedCameraSubscription = this.userMediaService.userVideo$.subscribe(
			userVideo => (this.selectedCamera = userVideo?.getVideoTracks()?.[0]?.label)
		);
	}

	ngOnDestroy() {
		this.userMediaService.cleanup();
		this.cameraSubscription?.unsubscribe();
		this.selectedCameraSubscription?.unsubscribe();
	}
}
