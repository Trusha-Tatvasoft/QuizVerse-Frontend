import { BattleCreationStatus, BattleTimeType } from '../../../shared/enums/battle-management.enum';
import { colors } from '../../../utils/constants';
import { TagColor } from '../../../utils/types/tag-component.type';
import { getDifficultyColor } from '../question-pool/components/question-pool-listing/question-pool-listing.mapper';
import { BattleCardData, BattleManagementData } from './interfaces/battle-management.interface';

export function battleToBattleCardData(battle: BattleManagementData): BattleCardData {
  return {
    id: battle.id,
    battleName: battle.battleName,
    category: battle.categoryName,
    description: battle.description,
    participants: battle.totalParticipants,
    totalXp: battle.totalXp,
    battleTime: battle.battleTime,
    dateRange: {
      start: battle.startDate,
      end: battle.endDate,
    },

    statusTag: {
      id: `status-${battle.id}`,
      label: BattleCreationStatus[battle.battleStatus],
      type: 'static',
      backgroundColor: getBattleStatusColor(battle.battleStatus).bg as TagColor,
      textColor: getBattleStatusColor(battle.battleStatus).text as TagColor,
      isSelected: false,
      hasBorder: true,
    },
    difficultyTag: {
      id: `difficulty-${battle.id}`,
      label: battle.battleDifficulty,
      type: 'static',
      backgroundColor: getDifficultyColor(battle.battleDifficulty).bg as TagColor,
      textColor: getDifficultyColor(battle.battleDifficulty).text as TagColor,
      hasBorder: false,
      isSelected: false,
    },
    questionTag: {
      id: `questions-${battle.id}`,
      label: `${battle.totalQuestion} Questions`,
      type: 'static',
      backgroundColor: 'lightWhite',
      textColor: 'black',
      hasBorder: true,
      isSelected: false,
    },
    timeTag: {
      id: `time-${battle.id}`,
      label: formatBattleTimeLabel(battle.battleTime),
      type: 'static',
      backgroundColor: battle.battleTime == 1 ? 'lightPurple' : ('lightBlue' as TagColor),
      textColor: battle.battleTime == 1 ? 'purple' : ('blue' as TagColor),
      hasBorder: false,
      isSelected: false,
    },
  };
}

export function getBattleStatusColor(status: BattleCreationStatus): { bg: string; text: string } {
  switch (status) {
    case BattleCreationStatus.Active:
      return colors.green;
    case BattleCreationStatus.Completed:
      return colors.black;
    default:
      return colors.black;
  }
}

export function formatBattleTimeLabel(time: BattleTimeType): string {
  return BattleTimeType[time].replace(/([a-z])([A-Z])/g, '$1 $2');
}
