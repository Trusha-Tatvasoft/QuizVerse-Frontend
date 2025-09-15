import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ValidationErrorService } from '../../../shared/service/validation-error/validation-error.service';
import {
  chooseFileButtonConfig,
  platformSettingHeaderConfig,
  platformSettingsFormFields,
  savePlateformButtonConfig,
} from './configs/platform-settings.config';
import { CommonModule } from '@angular/common';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FilledButtonComponent } from '../../../shared/components/filled-button/filled-button.component';
import { SnackbarService } from '../../../shared/service/snackbar/snackbar.service';
import { PlatformSettingsService } from '../../../services/admin/platform-settings/platform-settings.service';
import { PlatformConfigurationResponseDTO } from './interfaces/platform-settings.interface';
import { environment } from '../../../../environments/environment.dev';
import { plateformSettingCRUDMessages, platformMessages } from '../../../utils/constants';
import { FilenameTruncatePipe } from '../../../shared/pipes/filename-truncate/filename-truncate.pipe';
import { Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-platform-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FilledButtonComponent,
    FilenameTruncatePipe,
  ],
  templateUrl: './platform-settings.component.html',
  styleUrl: './platform-settings.component.scss',
})
export class PlatformSettingsComponent implements OnInit {
  // Configs and form fields
  platformSettingHeaderConfiguration = platformSettingHeaderConfig;
  platformSettingsFormFields = platformSettingsFormFields;
  savePlateformButtonConfig = savePlateformButtonConfig;
  chooseFileButtonConfigButton = chooseFileButtonConfig;

  platformSettingsForm!: FormGroup;
  platformConfig!: PlatformConfigurationResponseDTO;
  previewUrl: string | null = null;
  selectedFile: File | null = null;

  // Services
  private readonly fb = inject(FormBuilder);
  private readonly validationErrorService = inject(ValidationErrorService);
  private readonly snackbar = inject(SnackbarService);
  private readonly platformSettingsService = inject(PlatformSettingsService);

  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeForm();
    this.loadPlatformConfigurations();
  }

  // Error message for form field
  getError(fieldName: string): string | null {
    const control = this.platformSettingsForm.get(fieldName);
    const field = this.platformSettingsFormFields.find((f) => f.name === fieldName);
    const customMessages = field?.validationMessages || {};
    return this.validationErrorService.getErrorMessage(control!, customMessages, fieldName);
  }

  // Choose color by color picker
  colorChange(event: Event, controlName: string) {
    const color = (event.target as HTMLInputElement).value;
    this.validateAndSetColor(controlName, color);
  }

  // Choose color by text in hexcode
  textColorChange(event: Event, controlName: string) {
    let value = (event.target as HTMLInputElement).value.trim();

    if (!value.startsWith('#')) {
      value = '#' + value;
    }

    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (hexRegex.test(value)) {
      this.validateAndSetColor(controlName, value);
    }
  }

  // Save plateform configuration
  savePlatformConfig(): void {
    if (this.platformSettingsForm.valid) {
      const formValues = this.platformSettingsForm.value;

      // prepare FormData
      const formData = new FormData();
      formData.append('Quote', formValues.landingPageQuote);
      formData.append('DefaultsColors.PrimaryColor', formValues.primaryColor);
      formData.append('DefaultsColors.SecondaryColor', formValues.secondaryColor);

      if (formValues.siteLogo instanceof File) {
        formData.append('Logo', formValues.siteLogo);
      }

      this.platformSettingsService
        .updatePlatformConfigurations(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            if (res.result) {
              this.snackbar.showSuccess(
                platformMessages.successTitle,
                plateformSettingCRUDMessages.plateformSettingUpdated,
              );
            } else {
              this.snackbar.showError(platformMessages.errorTitle, res.message);
            }
          },
          error: (err) => {
            const message = err?.error?.message || platformMessages.errorMessage;
            this.snackbar.showError(`${platformMessages.errorTitle}`, message);
          },
        });
    } else {
      this.platformSettingsForm.markAllAsTouched();
    }
  }

  // Logo file selected
  fileSelected(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.previewUrl = null;
      this.selectedFile = null;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackbar.showError(plateformSettingCRUDMessages.invalidFileType);
        this.platformSettingsForm.get(fieldName)?.setValue(null);
        input.value = '';
        this.selectedFile = null;
        return;
      }

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
      this.selectedFile = file;

      // Store file in form
      this.platformSettingsForm.get(fieldName)?.setValue(file);
    } else {
      this.previewUrl = null;
      this.selectedFile = null;
      this.platformSettingsForm.get(fieldName)?.setValue(null);
    }
  }

  // Remove logo image
  removeImage(fieldName: string, input: HTMLInputElement): void {
    this.previewUrl = null;
    this.platformSettingsForm.get(fieldName)?.setValue(null);
    input.value = '';
    this.selectedFile = null;
  }

  //fetch file name
  displayFileName(fieldName: string): string {
    if (this.selectedFile?.name) {
      return this.selectedFile.name;
    }

    const profilePicValue = this.platformSettingsForm.get(fieldName)?.value;

    if (typeof profilePicValue === 'string') {
      return profilePicValue.split('/').pop() || 'No file chosen';
    }

    return 'No file chosen';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialize form from config field
  private initializeForm(): void {
    const group: Record<string, unknown[]> = {};

    this.platformSettingsFormFields.forEach((field) => {
      group[field.name] = ['', field.validators || []];
    });

    this.platformSettingsForm = this.fb.group(group);
  }

  // Load plateform configuration on page load
  private loadPlatformConfigurations(): void {
    this.platformSettingsService
      .getPlatformConfigurations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.result) {
            this.platformConfig = res.data;
            this.patchFormValues(res.data);
            this.previewUrl = `${environment.imageBaseUrl}/${res.data.logo}`;
          } else {
            this.snackbar.showError(platformMessages.errorTitle, res.message);
          }
        },
        error: (err) => {
          const message = err?.error?.message || platformMessages.errorMessage;
          this.snackbar.showError(`${platformMessages.errorTitle}`, message);
        },
      });
  }

  // Fill values in form
  private patchFormValues(config: PlatformConfigurationResponseDTO): void {
    this.platformSettingsForm.patchValue({
      landingPageQuote: config.quote || '',
      primaryColor: config.defaultsColors?.primaryColor || '#000000',
      secondaryColor: config.defaultsColors?.secondaryColor || '#000000',
    });
  }

  // Check for color look like white or not
  private isWhiteLike(hex: string, threshold: number = 200): boolean {
    const rgb = this.hexToRgb(hex);
    return rgb.r > threshold && rgb.g > threshold && rgb.b > threshold;
  }

  // Check for color similarity
  private areColorsSimilar(hex1: string, hex2: string, tolerance: number = 150): boolean {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);

    const diff = Math.abs(rgb1.r - rgb2.r) + Math.abs(rgb1.g - rgb2.g) + Math.abs(rgb1.b - rgb2.b);

    return diff < tolerance;
  }

  // Hex to rgb
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }

  // Validation for selected colors
  private validateAndSetColor(controlName: string, newColor: string) {
    const otherControlName = controlName === 'primaryColor' ? 'secondaryColor' : 'primaryColor';
    const otherColor = this.platformSettingsForm.get(otherControlName)?.value;

    // Check white-like
    if (this.isWhiteLike(newColor)) {
      this.snackbar.showError('White or very light colors are not allowed');
      this.revertToServiceValue(controlName);
      return;
    }

    // Check similarity with the other color
    if (otherColor && this.areColorsSimilar(newColor, otherColor)) {
      this.snackbar.showError('Primary and secondary colors cannot be the same or too similar');
      this.revertToServiceValue(controlName);
      return;
    }

    this.platformSettingsForm.get(controlName)?.setValue(newColor, { emitEvent: true });
  }

  // If validation failed, set default value for colors
  private revertToServiceValue(controlName: string) {
    this.platformSettingsService.platformConfig$
      .pipe(take(1))
      .pipe(takeUntil(this.destroy$))
      .subscribe((config) => {
        if (config?.defaultsColors) {
          const fallbackColor =
            controlName === 'primaryColor'
              ? config.defaultsColors.primaryColor
              : config.defaultsColors.secondaryColor;

          this.platformSettingsForm.get(controlName)?.setValue(fallbackColor, { emitEvent: false });
        }
      });
  }
}
