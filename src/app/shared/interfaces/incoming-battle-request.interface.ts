export interface IncomingBattleRequest {
  requestId: number;
  senderId: number;
  battleId: number;
  senderUserName: string;
  senderFullName: string;
  senderProfilePic: string;
  battleName: string;
  battleCategory: string;
  battleDifficulty: string;
  sendingDate?: Date;
  timeAgo?: string;
  totalXp: number;
}
