import {
  BattleFilterType,
  BattleTimeFilterType,
} from '../../../../shared/enums/user-recent-battle.enum';

export interface UserRecentBattles {
  battleName: string;
  opponent: string;
  opponentFullName: string;
  profilePic?: string;
  category: string;
  result: string;
  yourScore: number;
  opponentScore: number;
  xpGained: number;
  battleDate: Date;
}

export interface UserRecentBattlesWindow {
  globalIndex: number;
  battleName: string;
  opponent: string;
  opponentFullName: string;
  profilePic?: string;
  category: string;
  result: string;
  yourScore: number;
  opponentScore: number;
  xpGained: number;
  battleDate: Date;
}

export interface UserRecentBattlesResponseDto {
  battles: UserRecentBattles[];
  hasMore: boolean;
}

export interface UserRecentBattlesRequestDto {
  batchNumber: number;
  filterBy?: BattleFilterType | null;
  timefilterBy?: BattleTimeFilterType | null;
}
