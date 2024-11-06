import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { AvatarModule } from "primeng/avatar";
import { ProgressSpinnerModule } from "primeng/progressspinner";

@Component({
	selector: "app-player",
	standalone: true,
	imports: [CommonModule, AvatarModule, ProgressSpinnerModule],
	templateUrl: "./player.component.html",
	styleUrl: "./player.component.scss"
})
export class PlayerComponent implements AfterViewInit, OnChanges {
	videoState: "off" | "loading" | "on" = "off";

	@ViewChild("userVideo") userVideo!: ElementRef<HTMLVideoElement>;

	@Input() media?: MediaStream;

	@Input() avatar?: string;

	@Input() username?: string;

	ngAfterViewInit(): void {
		if (this.userVideo) {
			this.userVideo.nativeElement.addEventListener("loadeddata", () => (this.videoState = "on"));
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["media"]) {
			if (this.media) {
				this.videoState = "loading";
        this.userVideo.nativeElement.srcObject = this.media;
			} else {
				this.videoState = "off";
			}
		}
	}
}
