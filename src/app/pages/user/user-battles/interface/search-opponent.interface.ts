export interface BattleData {
  battleName: string;
  battleCategory: string;
  battleXp: number;
  battleDifficulty: string;
}

export interface MatchmakingPlayerDTO {
  connectionId: string;
  userId: number;
  battleId: number;
  currentLevel: number;
  enqueuedAt: string; // DateTime → string in JSON
}

export interface PlayerProfileDTO {
  userId: number;
  userName: string;
  fullName: string;
  currentLevel: number;
  winRate: number;
  profilePic?: string;
}

export interface MatchmakingResultDTO {
  isMatched: boolean;
  player?: MatchmakingPlayerDTO;
  opponent?: MatchmakingPlayerDTO;
  playerProfile?: PlayerProfileDTO;
  opponentProfile?: PlayerProfileDTO;
}
