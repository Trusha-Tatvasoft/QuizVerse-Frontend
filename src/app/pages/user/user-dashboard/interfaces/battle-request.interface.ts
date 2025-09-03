export interface BattleRequest {
  requestId: number;
  senderUserName: string;
  senderFullName: string;
  senderProfilePic?: string | null;
  battleName?: string | null;
  battleCategory: string;
  battleDifficulty: string;
  sendingDate: string;
  timeAgo: string;
}

export interface BattleRequestWithProfile extends BattleRequest {
  displayImage?: string | null;
  initials?: string;
  initialsColor?: string;
}
