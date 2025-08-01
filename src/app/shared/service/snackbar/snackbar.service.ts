import { CommonModule } from '@angular/common';
import { Component, inject, Inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import {
  snackbarDuration,
  snackbarHorizontalPosition,
  snackbarVerticalPostion,
} from '../../../utils/constants';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-snackbar',
  imports: [CommonModule, MatIcon],
  template: `
    <div class="flex items-center justify-between gap-4">
      <div class="flex text-base gap-3 max-w-sm items-center">
        <mat-icon fontSet="material-icons" class="icon-btn">{{ getIcon() }}</mat-icon>
        <div class="flex flex-col gap-1">
          <div class="font-bold text-base mb-1 block">{{ data.title }}</div>
          <div *ngIf="data.message" class="text-base break-all">{{ data.message }}</div>
        </div>
      </div>

      <button mat-icon-button (click)="close()" aria-label="Close" class="cursor-pointer">
        <mat-icon fontSet="material-icons" class="text-xs close-btn font-bold">close</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .icon-btn {
        font-size: 35px !important;
        width: 40px !important;
        height: auto !important;
      }
    `,
  ],
})
export class SnackbarComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: { title: string; type: string; message?: string },
    private readonly snackBarRef: MatSnackBarRef<SnackbarComponent>,
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  close() {
    this.snackBarRef.dismiss();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: snackbarDuration,
    horizontalPosition: snackbarHorizontalPosition,
    verticalPosition: snackbarVerticalPostion,
    panelClass: ['styled-snackbar'],
  };

  showSuccess(title: string, message?: string) {
    this.openSnackbar(title, message, 'success', ['success']);
  }

  showError(title: string, message?: string) {
    this.openSnackbar(title, message, 'error', ['error']);
  }

  showWarning(title: string, message?: string) {
    this.openSnackbar(title, message, 'warning', ['warning']);
  }

  showInfo(title: string, message?: string) {
    this.openSnackbar(title, message, 'info', ['info']);
  }

  public openSnackbar(
    title: string,
    message?: string,
    type: string = 'info',
    panelClass: string[] = [],
  ) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      ...this.defaultConfig,
      data: { title, message, type },
      panelClass: [...this.defaultConfig.panelClass!, ...panelClass],
    });
  }
}
