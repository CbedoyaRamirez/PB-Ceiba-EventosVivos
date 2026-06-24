import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado';

        if (error.status === 0) {
          errorMessage = 'No se puede conectar al servidor. Verifica tu conexión.';
        } else if (error.status === 400) {
          errorMessage = this.parseValidationErrors(error);
        } else if (error.status === 401) {
          errorMessage = 'No autorizado. Por favor, inicia sesión.';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permiso para realizar esta acción.';
        } else if (error.status === 404) {
          errorMessage = 'Recurso no encontrado.';
        } else if (error.status === 409) {
          errorMessage = 'Conflicto: El recurso ya existe o ha sido modificado.';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Intenta más tarde.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });

        return throwError(() => ({
          status: error.status,
          message: errorMessage,
          originalError: error.error
        }));
      })
    );
  }

  private parseValidationErrors(error: HttpErrorResponse): string {
    if (error.error?.errors) {
      const errorsArray = error.error.errors;
      if (Array.isArray(errorsArray)) {
        return errorsArray.map((e: any) => e.message || e).join(', ');
      }
      if (typeof errorsArray === 'object') {
        return Object.entries(errorsArray)
          .map(([_, messages]: [string, any]) => {
            if (Array.isArray(messages)) return messages.join(', ');
            return messages;
          })
          .join('; ');
      }
    }
    return error.error?.message || 'Error de validación. Verifica los datos ingresados.';
  }
}
