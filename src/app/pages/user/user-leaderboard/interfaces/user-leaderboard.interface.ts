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
  isLoggedInUser: boolean;
}

export interface WeeklyLeaderEntry {
  rank: number;
  userId: number;
  userName: string;
  fullName: string | null;
  profilePic: string | null;
  totalXp: number;
  totalQuizzesPlayed: number;
  totalBattlesPlayed: number;
  isLoggedInUser: boolean;
}

export interface CategoryLeaderEntry {
  rank: number;
  userId: number;
  userName: string;
  fullName: string | null;
  profilePic: string | null;
  averageScore: number;
  totalQuizzesPlayed: number;
  totalBattlesPlayed: number;
  isLoggedInUser: boolean;
}

export interface MonthlyLeaderEntry {
  rank: number;
  userId: number;
  userName: string;
  fullName: string | null;
  profilePic: string | null;
  totalXp: number;
  averageScore: number;
  totalQuizzesPlayed: number;
  totalBattlesPlayed: number;
  isLoggedInUser: boolean;
}
