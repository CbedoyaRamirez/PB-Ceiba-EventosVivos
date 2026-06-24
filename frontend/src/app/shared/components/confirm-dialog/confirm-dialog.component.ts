import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  textoBtnAceptar?: string;
  textoBtnCancelar?: string;
  tipo?: 'warning' | 'info' | 'error';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="modal-container">
      <div class="modal-header" [class]="'modal-header--' + (data.tipo || 'info')">
        <div class="modal-icon">
          <mat-icon [attr.data-type]="data.tipo || 'info'">
            {{ getIconName() }}
          </mat-icon>
        </div>
        <h2 mat-dialog-title class="modal-title">{{ data.titulo }}</h2>
      </div>

      <mat-dialog-content class="modal-content">
        <p class="modal-message">{{ data.mensaje }}</p>
      </mat-dialog-content>

      <mat-dialog-actions class="modal-actions">
        <button
          mat-stroked-button
          class="btn-cancel"
          (click)="onCancel()">
          {{ data.textoBtnCancelar || 'Cancelar' }}
        </button>
        <button
          mat-raised-button
          [class]="'btn-action btn-action--' + (data.tipo || 'info')"
          (click)="onAccept()">
          {{ data.textoBtnAceptar || 'Aceptar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host {
      --color-primary: #4F46E5;
      --color-primary-light: #6366f1;
      --color-warning: #f59e0b;
      --color-warning-light: #fbbf24;
      --color-error: #ef4444;
      --color-error-light: #f87171;
      --color-gray: #6B7280;
      --color-gray-light: #F3F4F6;
    }

    .modal-container {
      display: flex;
      flex-direction: column;
      border-radius: 16px;
      overflow: hidden;
      animation: dialogEnter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes dialogEnter {
      from {
        opacity: 0;
        transform: scale(0.92);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-header {
      padding: 32px 24px 24px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(255,255,255,0.15), transparent);
        border-radius: 50%;
        pointer-events: none;
      }
    }

    .modal-header--warning {
      background: linear-gradient(135deg, var(--color-warning), var(--color-warning-light));
    }

    .modal-header--error {
      background: linear-gradient(135deg, var(--color-error), var(--color-error-light));
    }

    .modal-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 1;

      mat-icon {
        width: 36px;
        height: 36px;
        font-size: 36px;
        color: white;
      }
    }

    .modal-title {
      margin: 0;
      color: white;
      font-family: 'Lora', 'Playfair Display', serif;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }

    .modal-content {
      padding: 24px 24px;
      background: #FFFFFF;
      flex: 1;
    }

    .modal-message {
      margin: 0;
      color: #374151;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 15px;
      line-height: 1.6;
      letter-spacing: -0.3px;
    }

    .modal-actions {
      padding: 16px 24px 24px;
      background: #FFFFFF;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      flex-wrap: wrap;

      ::ng-deep .mat-mdc-button-base {
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 13px;
      }
    }

    .btn-cancel {
      color: var(--color-gray);
      border-color: #E5E7EB;
      min-width: 100px;

      &:hover {
        background-color: var(--color-gray-light);
        border-color: #D1D5DB;
      }
    }

    .btn-action {
      min-width: 100px;
      color: white;
      background-color: var(--color-primary);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 8px 16px rgba(79, 70, 229, 0.3);
        transform: translateY(-2px);
      }
    }

    .btn-action--warning {
      background-color: var(--color-warning);

      &:hover {
        box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
      }
    }

    .btn-action--error {
      background-color: var(--color-error);

      &:hover {
        box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
      }
    }

    mat-dialog-content {
      padding: 0 !important;
    }

    mat-dialog-actions {
      padding: 0 !important;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {}

  onAccept(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getIconName(): string {
    switch (this.data.tipo) {
      case 'warning':
        return 'warning_amber';
      case 'error':
        return 'error_outline';
      case 'info':
      default:
        return 'check_circle';
    }
  }
}
