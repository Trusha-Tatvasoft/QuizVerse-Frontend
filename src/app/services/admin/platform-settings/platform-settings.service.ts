import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import { PlatformConfigurationResponseDTO } from '../../../pages/admin/platform-settings/interfaces/platform-settings.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class PlatformSettingsService {
  // Inject HttpClient
  private readonly http = inject(HttpClient);

  // BehaviorSubject to store and share settings globally
  private readonly platformConfigSubject =
    new BehaviorSubject<PlatformConfigurationResponseDTO | null>(null);
  platformConfig$ = this.platformConfigSubject.asObservable();

  constructor() {
    // This runs automatically when the service is instantiated
    this.setPlatformConfigurations().subscribe();
  }

  /**
   * Fetch platform configuration and update:
   * - BehaviorSubject (for sharing across app)
   * - CSS variables (theme colors)
   * - Logo URL (prepended with base path)
   * @returns Observable containing API response with platform configuration data
   */
  setPlatformConfigurations(): Observable<ApiResponse<PlatformConfigurationResponseDTO>> {
    return this.http
      .get<
        ApiResponse<PlatformConfigurationResponseDTO>
      >(`${environment.baseUrl}/${EndPoints.GetPlateformSetting}`)
      .pipe(
        tap((res) => {
          if (res.data) {
            if (res.data.logo) res.data.logo = `${environment.imageBaseUrl}/${res.data.logo}`;
            this.platformConfigSubject.next(res.data);
            document.documentElement.style.setProperty(
              '--global-primary-color',
              res.data.defaultsColors.primaryColor,
            );
            document.documentElement.style.setProperty(
              '--global-secondary-color',
              res.data.defaultsColors.secondaryColor,
            );
          }
        }),
      );
  }

  /**
   * Get platform configuration from backend (without updating BehaviorSubject).
   * @returns Observable containing API response with platform configuration data
   */
  getPlatformConfigurations(): Observable<ApiResponse<PlatformConfigurationResponseDTO>> {
    return this.http.get<ApiResponse<PlatformConfigurationResponseDTO>>(
      `${environment.baseUrl}/${EndPoints.GetPlateformSetting}`,
    );
  }

  /**
   * Update platform configuration in the backend.
   * On success, refreshes the global BehaviorSubject and theme.
   * @param formData FormData containing logo, colors, etc.
   * @returns Observable containing API response with null result (success/failure only)
   */
  updatePlatformConfigurations(formData: FormData): Observable<ApiResponse<null>> {
    return this.http
      .post<
        ApiResponse<null>
      >(`${environment.baseUrl}/${EndPoints.UpdatePlateformSetting}`, formData)
      .pipe(
        tap((res) => {
          if (res.result) {
            this.setPlatformConfigurations().subscribe();
          }
        }),
      );
  }
}
