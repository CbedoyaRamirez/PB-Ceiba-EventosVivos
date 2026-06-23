import { Routes } from '@angular/router';
import { ReservaPanelComponent } from './reserva-panel/reserva-panel.component';
import { ReservaFormComponent } from './reserva-form/reserva-form.component';

export const reservasRoutes: Routes = [
  {
    path: '',
    component: ReservaPanelComponent
  },
  {
    path: 'eventos/:id/nueva',
    component: ReservaFormComponent
  }
];
