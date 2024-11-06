import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected baseUrl = 'http://localhost:8080';

  user?: User

  constructor(private http: HttpClient) { }

  getSession() {
    return this.http.get(`${this.baseUrl}/profile`, { withCredentials: true }).subscribe({
      next: (user) => {
        this.user = user as User

        return user
      },
      error: () => window.location.href = "http://localhost:5173/login?next=" + encodeURIComponent(window.location.href)
    });
  }
}
