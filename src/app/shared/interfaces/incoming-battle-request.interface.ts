export interface IncomingBattleRequest {
  requestId: number; // Unique identifier for the battle request
  senderUserName: string;
  senderFullName: string;
  senderProfilePic: string;
  battleName: string; // Name of the user who sent the request
  battleCategory: string; // Category of the battle (e.g., Math, Coding)
  battleDifficulty: string; // Difficulty level
  // You can add optional fields if needed
  sendingDate?: Date; // Timestamp when the request was created
  timeAgo?: string; // Optional avatar image URL
}
