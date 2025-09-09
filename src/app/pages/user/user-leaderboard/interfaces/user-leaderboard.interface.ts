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
