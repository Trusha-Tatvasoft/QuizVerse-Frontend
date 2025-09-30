export interface DialogData {
  battleId: number;
  battleName: string;
}

export interface BattleUserSearchResult {
  fullName: string;
  userName: string;
  profilePic: string | null;
  totalXp: number;
  hasRequest: boolean;
}
