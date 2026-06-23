import { Routes } from '@angular/router';
import { EventoListComponent } from './evento-list/evento-list.component';
import { EventoFormComponent } from './evento-form/evento-form.component';
import { EventoDetailComponent } from './evento-detail/evento-detail.component';

export const eventosRoutes: Routes = [
  {
    path: '',
    component: EventoListComponent
  },
  {
    path: 'nuevo',
    component: EventoFormComponent
  },
  {
    path: ':id',
    component: EventoDetailComponent
  },
  {
    path: ':id/editar',
    component: EventoFormComponent
  }
];
