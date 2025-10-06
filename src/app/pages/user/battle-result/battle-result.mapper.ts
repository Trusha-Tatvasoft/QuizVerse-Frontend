import { BattleOutcome } from '../../../shared/enums/battle-outcome.enum';
import { BattleStatus } from '../../../shared/enums/battle-status.enum';
import { BattleResult, BattleResultResponse } from './interfaces/battle-result.interface';

export function mapUserBattleResultToBattleResult(data: BattleResultResponse): BattleResult {
  let result: BattleOutcome;

  switch (data.battleStatus) {
    case BattleStatus.Completed: // completed
      result = data.isWin ? BattleOutcome.Victory : BattleOutcome.Defeat;
      break;
    case BattleStatus.Draw: // draw
      result = BattleOutcome.Draw;
      break;
    case BattleStatus.Running: // running
      result = BattleOutcome.Defeat; // or maybe a `Running` state if your enum supports it
      break;
    default:
      result = BattleOutcome.Defeat; // fallback
  }

  return {
    title: data.battleName,
    result,
    you: {
      username: 'You',
      fullName: data.playerFullName,
      profileImageUrl: data.playerProfile ?? null,
      score: data.playerAttemptedQuestions,
      isWinner: data.isWin,
    },
    opponent: {
      username: data.opponentUserName,
      fullName: data.opponentFullName,
      profileImageUrl: data.opponentProfile ?? null,
      score: data.opponentAttemptedQuestions,
      isWinner: !data.isWin && data.battleStatus !== BattleStatus.Draw,
    },
    rewards: {
      points: data.playerEarnedXP,
      description: 'XP earned for this battle',
    },
  };
}
