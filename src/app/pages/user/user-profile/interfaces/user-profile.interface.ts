export interface UserBasicProfile {
  userId: number;
  profilePic: string;
  name: string;
  rank: string;
  nextRank: string;
  memberSince: string;
  progress: number;
  totalXp: number;
  quizCompleted: number;
  winRate: number;
  achievements: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  xp: number;
  timestamp?: string;
}

export interface UserOverview {
  globalRank: number;
  bestCategory: string;
  longestStreak: number;
  recentActivity?: RecentActivity[];
}
