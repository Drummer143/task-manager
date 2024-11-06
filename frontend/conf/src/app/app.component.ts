import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ApiService } from "./shared/services/api.service";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss"
})
export class AppComponent implements OnInit {
	title = "conf";

	constructor(private api: ApiService) {}

	ngOnInit(): void {
		this.api.getSession();
	}
}
