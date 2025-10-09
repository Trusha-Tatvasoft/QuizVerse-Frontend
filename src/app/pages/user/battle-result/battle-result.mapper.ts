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
      result = data.isWin ? BattleOutcome.Draw : BattleOutcome.Defeat;
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
      isWinner: result === BattleOutcome.Defeat && data.battleStatus === BattleStatus.Completed,
    },
    rewards: {
      points: data.playerEarnedXP,
      description: 'Experience Points Earned',
    },
  };
}
