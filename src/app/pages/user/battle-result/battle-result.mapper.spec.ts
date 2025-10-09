import { BattleOutcome } from '../../../shared/enums/battle-outcome.enum';
import { BattleStatus } from '../../../shared/enums/battle-status.enum';
import { mapUserBattleResultToBattleResult } from './battle-result.mapper';
import { BattleResultResponse } from './interfaces/battle-result.interface';

describe('mapUserBattleResultToBattleResult', () => {
  const baseResponse: BattleResultResponse = {
    battleName: 'Math Quiz',
    battleStatus: BattleStatus.Completed,
    isWin: true,
    playerFullName: 'John Doe',
    playerProfile: 'player.png',
    playerAttemptedQuestions: 8,
    opponentUserName: 'opponent123',
    opponentFullName: 'Jane Doe',
    opponentProfile: 'opponent.png',
    opponentAttemptedQuestions: 7,
    playerEarnedXP: 50,
  };

  it('should map a completed battle with a win to Victory', () => {
    const result = mapUserBattleResultToBattleResult({
      ...baseResponse,
      battleStatus: BattleStatus.Completed,
      isWin: true,
    });

    expect(result.result).toBe(BattleOutcome.Victory);
    expect(result.you.isWinner).toBe(true);
    expect(result.opponent.isWinner).toBe(false);
  });

  it('should map a completed battle with a loss to Defeat', () => {
    const result = mapUserBattleResultToBattleResult({
      ...baseResponse,
      battleStatus: BattleStatus.Completed,
      isWin: false,
    });

    expect(result.result).toBe(BattleOutcome.Defeat);
    expect(result.you.isWinner).toBe(false);
    expect(result.opponent.isWinner).toBe(true);
  });

  it('should map a battle with Draw status to Draw outcome', () => {
    const result = mapUserBattleResultToBattleResult({
      ...baseResponse,
      battleStatus: BattleStatus.Draw,
      isWin: true,
    });

    expect(result.result).toBe(BattleOutcome.Draw);
    expect(result.you.isWinner).toBe(true);
    expect(result.opponent.isWinner).toBe(false);
  });

  it('should map a Running battle to Defeat outcome (or Running if enum updated)', () => {
    const result = mapUserBattleResultToBattleResult({
      ...baseResponse,
      battleStatus: BattleStatus.Running,
    });

    expect(result.result).toBe(BattleOutcome.Defeat);
  });

  it('should fallback to Defeat if status is unknown', () => {
    const result = mapUserBattleResultToBattleResult({
      ...baseResponse,
      battleStatus: 999 as any, // invalid status
    });

    expect(result.result).toBe(BattleOutcome.Defeat);
  });

  it('should map all fields correctly', () => {
    const result = mapUserBattleResultToBattleResult(baseResponse);

    expect(result.title).toBe('Math Quiz');
    expect(result.you.fullName).toBe('John Doe');
    expect(result.you.username).toBe('You');
    expect(result.you.profileImageUrl).toBe('player.png');
    expect(result.you.score).toBe(8);

    expect(result.opponent.username).toBe('opponent123');
    expect(result.opponent.fullName).toBe('Jane Doe');
    expect(result.opponent.profileImageUrl).toBe('opponent.png');
    expect(result.opponent.score).toBe(7);

    expect(result.rewards.points).toBe(50);
    expect(result.rewards.description).toBe('Experience Points Earned');
  });
});
