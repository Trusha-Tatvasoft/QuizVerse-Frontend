export enum BattleTimeFilterType {
  last_2_Days = 1,
  last_7_Days = 2,
  current_month = 3,
  last_quarter = 4,
  current_year = 5,
  last_year = 6,
}

export enum BattleFilterType {
  draw = 1,
  lost = 2,
  won = 3,
}

export const BattleTimeFilterDisplayNames: Record<BattleTimeFilterType, string> = {
  [BattleTimeFilterType.last_2_Days]: 'Last 2 Days',
  [BattleTimeFilterType.last_7_Days]: 'Last 7 Days',
  [BattleTimeFilterType.current_month]: 'This Month',
  [BattleTimeFilterType.last_quarter]: 'Last Quarter',
  [BattleTimeFilterType.current_year]: 'This Year',
  [BattleTimeFilterType.last_year]: 'Last Year',
};

export const BattleFilterDisplayNames: Record<BattleFilterType, string> = {
  [BattleFilterType.draw]: 'Draw',
  [BattleFilterType.lost]: 'Lost',
  [BattleFilterType.won]: 'Won',
};
