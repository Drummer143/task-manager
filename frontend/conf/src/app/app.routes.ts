import { Routes } from '@angular/router';

export const routes: Routes = [{
	path: '',
	loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
}, {
	path: 'room',
	loadComponent: () => import('./pages/room/room.component').then(m => m.RoomComponent)
}];
