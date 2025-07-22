import { CommonModule } from '@angular/common';
import { Component, Inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import {
  SNACKBAR_DURATION,
  SNACKBAR_HORIZONTAL_POSITION,
  SNACKBAR_VERTICAL_POSITION,
} from '../../../utils/constants';

@Component({
  selector: 'app-snackbar',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col whitespace-pre-line">
      <div>
        <span class="font-bold text-base mb-1 block">{{ data.title }}</span>
        <span *ngIf="data.message" class="text-base">{{ data.message }}</span>
      </div>
    </div>
  `,
})
export class SnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { title: string; message?: string }) {}
}

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  constructor(private readonly snackBar: MatSnackBar) {}

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: SNACKBAR_DURATION,
    horizontalPosition: SNACKBAR_HORIZONTAL_POSITION,
    verticalPosition: SNACKBAR_VERTICAL_POSITION,
    panelClass: ['styled-snackbar'],
  };

  showSuccess(title: string, message?: string) {
    this.openSnackbar(title, message, ['success']);
  }

  showError(title: string, message?: string) {
    this.openSnackbar(title, message, ['error']);
  }

  showWarning(title: string, message?: string) {
    this.openSnackbar(title, message, ['warning']);
  }

  showInfo(title: string, message?: string) {
    this.openSnackbar(title, message, ['info']);
  }

  private openSnackbar(title: string, message?: string, panelClass: string[] = []) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      ...this.defaultConfig,
      data: { title, message },
      panelClass: [...this.defaultConfig.panelClass!, ...panelClass],
    });
  }
}
