import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ApiService } from "./shared/services/api/api.service";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [RouterOutlet, ToastModule],
	providers: [MessageService],
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
