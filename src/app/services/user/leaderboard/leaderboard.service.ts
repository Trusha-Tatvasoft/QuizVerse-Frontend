import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../shared/interfaces/api-response.interface';
import { environment } from '../../../../environments/environment.dev';
import { EndPoints } from '../../../shared/enums/end-point.enum';
import {
  CategoryLeaderEntry,
  LeaderboardEntry,
  MonthlyLeaderEntry,
  UserLeaderboardStats,
  WeeklyLeaderEntry,
} from '../../../pages/user/user-leaderboard/interfaces/user-leaderboard.interface';
import { CommonListDropDown } from '../../../shared/interfaces/common-dropdown.interface';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  private readonly http = inject(HttpClient);

  /**
   * Fetch user leaderboard statistics (global rank, total XP, current level) from backend.
   * @returns Observable of user leaderboard stats wrapped in ApiResponse.
   */
  getUserLeaderboardStats(): Observable<ApiResponse<UserLeaderboardStats>> {
    return this.http.get<ApiResponse<UserLeaderboardStats>>(
      `${environment.baseUrl}/${EndPoints.UserLeaderboardStats}`,
    );
  }

  /**
   * Fetch global leaderboard data from backend.
   * @returns Observable of leaderboard entries wrapped in ApiResponse.
   */
  getGlobalLeaderboard(): Observable<ApiResponse<LeaderboardEntry[]>> {
    return this.http.get<ApiResponse<LeaderboardEntry[]>>(
      `${environment.baseUrl}/${EndPoints.GlobalLeaderboard}`,
    );
  }

  /**
   * Fetch weekly leaderboard data from backend.
   * @returns Observable of weekly leader entries wrapped in ApiResponse.
   */
  getWeeklyLeaderboard(): Observable<ApiResponse<WeeklyLeaderEntry[]>> {
    return this.http.get<ApiResponse<WeeklyLeaderEntry[]>>(
      `${environment.baseUrl}/${EndPoints.WeeklyLeaderboard}`,
    );
  }

  /**
   * Fetch category-wise leaderboard data from backend.
   * @param categoryId The ID of the quiz category.
   * @returns Observable of leaderboard entries wrapped in ApiResponse.
   */
  getCategoryLeaderboard(categoryId: number): Observable<ApiResponse<CategoryLeaderEntry[]>> {
    return this.http.get<ApiResponse<CategoryLeaderEntry[]>>(
      `${environment.baseUrl}/${EndPoints.CategoryLeaderboard}?categoryId=${categoryId}`,
    );
  }

  /**
   * Fetch list of available years from backend.
   * @returns Observable of CommonListDropDown array wrapped in ApiResponse.
   */
  getAvailableYears(): Observable<ApiResponse<CommonListDropDown[]>> {
    return this.http.get<ApiResponse<CommonListDropDown[]>>(
      `${environment.baseUrl}/${EndPoints.AvailableYears}`,
    );
  }

  /**
   * Fetch list of available months for a given year from backend.
   * @param year The year for which to fetch available months.
   * @returns Observable of CommonListDropDown array wrapped in ApiResponse.
   */
  getAvailableMonthsByYear(year: number): Observable<ApiResponse<CommonListDropDown[]>> {
    return this.http.get<ApiResponse<CommonListDropDown[]>>(
      `${environment.baseUrl}/${EndPoints.AvailableMonths}/${year}`,
    );
  }

  /**
   * Fetch monthly champions for a given month and year.
   * @param month The selected month (1-12)
   * @param year The selected year (e.g., 2025)
   * @returns Observable of monthly champion entries wrapped in ApiResponse.
   */
  getMonthlyChampions(month: number, year: number): Observable<ApiResponse<MonthlyLeaderEntry[]>> {
    return this.http.get<ApiResponse<MonthlyLeaderEntry[]>>(
      `${environment.baseUrl}/${EndPoints.MonthlyChampions}?month=${month}&year=${year}`,
    );
  }
}
