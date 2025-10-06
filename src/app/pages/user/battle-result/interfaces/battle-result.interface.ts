import { BattleOutcome } from '../../../../shared/enums/battle-outcome.enum';

export interface PlayerResult {
  username: string;
  fullName: string; // e.g. "John Doe"
  profileImageUrl?: string | null; // can be URL, undefined, or null
  score: number;
  isWinner?: boolean;
}

export interface BattleResult {
  title: string; // e.g. "Science Battle Complete"
  result: BattleOutcome;
  you: PlayerResult;
  opponent: PlayerResult;
  rewards: {
    points: number;
    description: string;
  };
}

export interface BattleResultResponse {
  battleName: string;
  opponentUserName: string;
  playerProfile?: string | null;
  playerFullName: string;
  opponentFullName: string;
  opponentProfile?: string | null;
  battleStatus: number; // e.g., 1 = completed 2 = draw, 3 = running
  isWin: boolean;
  playerAttemptedQuestions: number;
  opponentAttemptedQuestions: number;
  playerEarnedXP: number;
}
