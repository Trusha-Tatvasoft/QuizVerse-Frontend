import {
  BattleCreationStatus,
  BattleTimeType,
} from '../../../../shared/enums/battle-management.enum';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export interface BattleManagementData {
  id: number;
  startDate: Date | null;
  endDate: Date | null;
  battleTime: BattleTimeType;
  battleName: string;
  description: string;
  categoryName: string;
  battleDifficulty: string;
  totalXp: number;
  totalParticipants: number;
  totalQuestion: number;
  battleStatus: BattleCreationStatus;
}

export interface BattleCardData {
  id: number;
  battleName: string;
  category: string;
  description: string;
  participants: number;
  totalXp: number;
  battleTime: BattleTimeType;
  dateRange: { start: Date | null; end: Date | null };
  statusTag: TagInputConfig;
  difficultyTag: TagInputConfig;
  questionTag: TagInputConfig;
  timeTag: TagInputConfig;
}

export interface BattleManagementDataResponseDto {
  battles: BattleManagementData[];
  hasMore: boolean;
}
