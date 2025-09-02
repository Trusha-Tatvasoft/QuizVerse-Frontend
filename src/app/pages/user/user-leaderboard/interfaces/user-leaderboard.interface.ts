import { Type } from '@angular/core';

export interface UserLeaderboardStats {
  globalRank: number;
  totalXp: number;
  currentLevel: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  fullName: string | null;
  profilePic: string | null;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  newGlobalRank: number;
  trend: number;
  is_loggedin_user: boolean;
}

export interface LeaderboardTab {
  id: string;
  label: string;
  icon?: string;
  loadChildren: () => Promise<Type<unknown>>;
}
