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

	voiceDetectionInterval?: ReturnType<typeof setInterval>;

	@ViewChild("userVideo") userVideo!: ElementRef<HTMLVideoElement>;

	@Input({ required: true }) videoPlaying!: boolean;

	@Input({ required: true }) muted!: boolean;

	@Input() media?: MediaStream;

	@Input() avatar?: string;

	@Input() username?: string;

	ngAfterViewInit(): void {
		// this.voiceDetectionInterval = setInterval(() => this.detectSpeech(), 1000);

		if (this.userVideo) {
			this.userVideo.nativeElement.addEventListener("loadeddata", () => (this.videoState = "on"));
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["videoPlaying"] || changes["media"]) {
			if (this.media && this.videoPlaying) {
				this.videoState = "loading";
				this.userVideo.nativeElement.srcObject = this.media;
			} else {
				this.videoState = "off";
			}
		}
	}

	// async detectSpeech() {
	// 	try {
	// 		if (this.muted || !this.media) return undefined;
	// 		// Step 1: Request access to the microphone
	// 		const audioContext = new (window.AudioContext || (window as any)?.webkitAudioContext)();
	// 		const source = audioContext.createMediaStreamSource(this.media!);

	// 		// Step 2: Create an analyser node
	// 		const analyser = audioContext.createAnalyser();
	// 		analyser.fftSize = 512; // You can adjust the FFT size for different levels of sensitivity
	// 		const dataArray = new Uint8Array(analyser.frequencyBinCount);

	// 		// Step 3: Connect the source to the analyser
	// 		source.connect(analyser);

	// 		function checkVolume() {
	// 			// Step 4: Get frequency data from the analyser
	// 			analyser.getByteFrequencyData(dataArray);

	// 			// Step 5: Calculate average volume level
	// 			let values = 0;
	// 			for (let i = 0; i < dataArray.length; i++) {
	// 				values += dataArray[i];
	// 			}
	// 			const averageVolume = values / dataArray.length;

	// 			// Step 6: Detect if volume is above a threshold (indicating speaking)
	// 			const speakingThreshold = 30; // Adjust this threshold as needed
	// 			if (averageVolume > speakingThreshold) {
	// 				console.log("Detected speaking", averageVolume, speakingThreshold);
	// 			} else {
	// 				console.log("Silent", averageVolume, speakingThreshold);
	// 			}
	// 		}

	// 		// Start checking volume
	// 		checkVolume();
	// 	} catch (error) {
	// 		console.error("Error accessing the microphone:", error);
	// 	}
	// }
}
