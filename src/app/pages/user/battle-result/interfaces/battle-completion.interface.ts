export interface BattleCompletionResult {
  battleStatus: number;
  winnerId?: number;
  winnerGainedXp: number;
  looserGainedXp: number;
  user1CorrectedAns: number;
  user2CorrectedAns: number;
  user1TakenTime: string; // TimeSpan → string
  user2TakenTime: string; // TimeSpan → string
}
