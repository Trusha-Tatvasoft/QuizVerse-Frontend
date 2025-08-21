import { battleToBattleCardData } from './battle-management-list.mapper';
import { BattleManagementData } from './interfaces/battle-management.interface';
import { BattleStatus, BattleTimeType } from '../../../shared/enums/battle-management.enum';
import { getDifficultyColor } from '../question-pool/components/question-pool-listing/question-pool-listing.mapper';

jest.mock('../question-pool/components/question-pool-listing/question-pool-listing.mapper', () => ({
  getDifficultyColor: jest.fn().mockReturnValue({ bg: 'lightRed', text: 'red' }),
}));

describe('battleToBattleCardData', () => {
  let mockBattle: BattleManagementData;

  beforeEach(() => {
    jest.clearAllMocks();

    mockBattle = {
      id: 1,
      battleName: 'Test Battle',
      categoryName: 'General',
      description: 'Mock battle description',
      totalParticipants: 10,
      totalXp: 200,
      battleTime: BattleTimeType.Permanent,
      startDate: new Date('2025-08-19T00:00:00Z'),
      endDate: new Date('2025-08-20T00:00:00Z'),
      battleDifficulty: 'Easy',
      totalQuestion: 15,
      battleStatus: BattleStatus.Active,
    };
  });

  it('should map battle data correctly to BattleCardData', () => {
    const result = battleToBattleCardData(mockBattle);

    expect(result.id).toBe(mockBattle.id);
    expect(result.battleName).toBe(mockBattle.battleName);
    expect(result.category).toBe(mockBattle.categoryName);
    expect(result.description).toBe(mockBattle.description);
    expect(result.participants).toBe(mockBattle.totalParticipants);
    expect(result.totalXp).toBe(mockBattle.totalXp);
    expect(result.dateRange.start).toBe(mockBattle.startDate);
    expect(result.dateRange.end).toBe(mockBattle.endDate);
  });

  it('should create a valid statusTag for Active battles', () => {
    const result = battleToBattleCardData(mockBattle);

    expect(result.statusTag.label).toBe('Active');
    expect(result.statusTag.backgroundColor).toBe('lightGreen');
    expect(result.statusTag.textColor).toBe('green');
  });

  it('should create a valid difficultyTag using getDifficultyColor', () => {
    const result = battleToBattleCardData(mockBattle);

    expect(getDifficultyColor).toHaveBeenCalledWith('Easy');
    expect(result.difficultyTag.label).toBe('Easy');
    expect(result.difficultyTag.backgroundColor).toBe('lightRed');
    expect(result.difficultyTag.textColor).toBe('red');
  });

  it('should create a valid questionTag', () => {
    const result = battleToBattleCardData(mockBattle);

    expect(result.questionTag.label).toBe('15 Questions');
    expect(result.questionTag.backgroundColor).toBe('lightWhite');
    expect(result.questionTag.textColor).toBe('black');
  });

  it('should create a valid timeTag for OneVsOne', () => {
    const result = battleToBattleCardData(mockBattle);

    expect(result.timeTag.label).toBe('Permanent'); // formatted with space
    expect(result.timeTag.backgroundColor).toBe('lightPurple');
    expect(result.timeTag.textColor).toBe('purple');
  });

  it('should fallback to default colors when status is unknown', () => {
    mockBattle.battleStatus = 999 as unknown as BattleStatus;
    const result = battleToBattleCardData(mockBattle);

    expect(result.statusTag.backgroundColor).toBe('black');
    expect(result.statusTag.textColor).toBe('lightWhite');
  });
  it('should create a valid statusTag for Completed battles', () => {
    mockBattle.battleStatus = BattleStatus.Completed;
    const result = battleToBattleCardData(mockBattle);

    expect(result.statusTag.label).toBe('Completed');
    expect(result.statusTag.backgroundColor).toBe('black');
    expect(result.statusTag.textColor).toBe('lightWhite');
  });

  it('should create a valid timeTag for Time Limited battles', () => {
    mockBattle.battleTime = BattleTimeType.TimeLimited;
    const result = battleToBattleCardData(mockBattle);

    expect(result.timeTag.label).toBe('Time Limited'); // formatted with space
    expect(result.timeTag.backgroundColor).toBe('lightBlue');
    expect(result.timeTag.textColor).toBe('blue');
  });
});
