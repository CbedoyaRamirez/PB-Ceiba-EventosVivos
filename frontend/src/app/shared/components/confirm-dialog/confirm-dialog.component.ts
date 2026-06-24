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
    <div class="modal-container" [attr.data-type]="data.tipo || 'info'">
      <div class="modal-decoration"></div>

      <div class="modal-body">
        <div class="modal-icon-wrap">
          <mat-icon>
            {{ getIconName() }}
          </mat-icon>
        </div>
        <h2 mat-dialog-title class="modal-title">{{ data.titulo }}</h2>
        <mat-dialog-content class="modal-content">
          <p class="modal-message">{{ data.mensaje }}</p>
        </mat-dialog-content>
      </div>

      <div class="modal-divider"></div>

      <mat-dialog-actions class="modal-footer">
        <button
          mat-stroked-button
          class="btn-cancel"
          (click)="onCancel()">
          {{ data.textoBtnCancelar || 'Cancelar' }}
        </button>
        <button
          mat-raised-button
          class="btn-action"
          (click)="onAccept()">
          {{ data.textoBtnAceptar || 'Aceptar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host {
      --icon-bg-info: #EEF2FF;
      --icon-color-info: #4F46E5;
      --action-color-info: #4F46E5;
      --icon-bg-error: #FEF2F2;
      --icon-color-error: #EF4444;
      --action-color-error: #EF4444;
      --icon-bg-warning: #FFFBEB;
      --icon-color-warning: #D97706;
      --action-color-warning: #D97706;
    }

    .modal-container {
      display: flex;
      flex-direction: column;
      border-radius: 24px;
      overflow: hidden;
      background: #FFFFFF;
      position: relative;
      animation: modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalSlideUp {
      from {
        opacity: 0;
        transform: translateY(24px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .modal-decoration {
      position: absolute;
      top: -1px;
      right: -1px;
      width: 120px;
      height: 120px;
      border-radius: 0 24px 0 80%;
      opacity: 0.08;
      pointer-events: none;
      z-index: 0;
    }

    .modal-container[data-type="info"] .modal-decoration {
      background: var(--icon-color-info);
    }

    .modal-container[data-type="error"] .modal-decoration {
      background: var(--icon-color-error);
    }

    .modal-container[data-type="warning"] .modal-decoration {
      background: var(--icon-color-warning);
    }

    .modal-body {
      padding: 40px 32px 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .modal-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: iconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both;

      mat-icon {
        width: 40px;
        height: 40px;
        font-size: 40px;
      }
    }

    .modal-container[data-type="info"] .modal-icon-wrap {
      background: var(--icon-bg-info);
      color: var(--icon-color-info);
    }

    .modal-container[data-type="error"] .modal-icon-wrap {
      background: var(--icon-bg-error);
      color: var(--icon-color-error);
    }

    .modal-container[data-type="warning"] .modal-icon-wrap {
      background: var(--icon-bg-warning);
      color: var(--icon-color-warning);
    }

    @keyframes iconPop {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-title {
      margin: 0;
      color: #111827;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
      animation: fadeInDown 0.5s ease-out 0.1s both;
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-content {
      padding: 0 !important;
      margin: 0;
      animation: fadeInDown 0.5s ease-out 0.15s both;
    }

    .modal-message {
      margin: 0;
      color: #6B7280;
      font-size: 15px;
      line-height: 1.65;
      letter-spacing: -0.2px;
      max-width: 340px;
    }

    .modal-divider {
      height: 1px;
      background: #F3F4F6;
    }

    .modal-footer {
      padding: 20px 32px 28px !important;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      flex-wrap: wrap;
      z-index: 1;
      animation: fadeInUp 0.5s ease-out 0.2s both;

      ::ng-deep .mat-mdc-button-base {
        font-weight: 500;
        letter-spacing: 0.3px;
        font-size: 14px;
        text-transform: none;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .btn-cancel {
      color: #6B7280;
      border-color: #E5E7EB;
      border: 1px solid #E5E7EB;
      min-width: 120px;
      background: transparent;
      transition: all 0.2s ease;

      &:hover {
        background-color: #F9FAFB;
        border-color: #D1D5DB;
      }
    }

    .btn-action {
      min-width: 140px;
      color: white;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }
    }

    .modal-container[data-type="info"] .btn-action {
      background-color: var(--action-color-info);

      &:hover {
        box-shadow: 0 12px 24px rgba(79, 70, 229, 0.25);
      }
    }

    .modal-container[data-type="error"] .btn-action {
      background-color: var(--action-color-error);

      &:hover {
        box-shadow: 0 12px 24px rgba(239, 68, 68, 0.25);
      }
    }

    .modal-container[data-type="warning"] .btn-action {
      background-color: var(--action-color-warning);

      &:hover {
        box-shadow: 0 12px 24px rgba(217, 119, 6, 0.25);
      }
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
