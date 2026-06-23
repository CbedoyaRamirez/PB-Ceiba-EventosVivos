import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <span class="app-title">EventosVivos</span>
      <span class="spacer"></span>
      <nav class="navbar">
        <a mat-button routerLink="/eventos" routerLinkActive="active">
          <mat-icon>event</mat-icon>
          Eventos
        </a>
        <a mat-button routerLink="/reservas" routerLinkActive="active">
          <mat-icon>bookmark</mat-icon>
          Reservas
        </a>
      </nav>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <footer class="app-footer">
      <p>&copy; 2026 EventosVivos. Todos los derechos reservados.</p>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .app-toolbar {
      display: flex;
      align-items: center;
      padding: 0 24px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .app-title {
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 0.5px;
      font-family: var(--font-serif, 'Lora', serif);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .navbar {
      display: flex;
      gap: 12px;
    }

    .navbar a {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 200ms;
      position: relative;
      font-size: 14px;
    }

    .navbar a:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .navbar a.active {
      font-weight: 500;
      border-bottom: 3px solid white;
      padding-bottom: 5px;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
    }

    .app-footer {
      padding: 24px;
      text-align: center;
      background: linear-gradient(135deg, #f0eeff 0%, #faf9ff 100%);
      border-top: 1px solid #e8e6ff;
      color: #6366f1;
      font-size: 13px;
      font-weight: 500;
    }

    .app-footer p {
      margin: 0;
    }

    mat-icon {
      margin-right: 4px;
    }
  `]
})
export class App {}
