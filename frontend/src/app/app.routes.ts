import { Routes } from '@angular/router';
import { eventosRoutes } from './features/eventos/eventos.routes';
import { reservasRoutes } from './features/reservas/reservas.routes';

export const routes: Routes = [
  {
    path: 'eventos',
    children: eventosRoutes
  },
  {
    path: 'reservas',
    children: reservasRoutes
  },
  {
    path: '',
    redirectTo: '/eventos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/eventos'
  }
];
