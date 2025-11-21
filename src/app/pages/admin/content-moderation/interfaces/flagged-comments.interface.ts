export interface FlaggedComments {
  id: number;
  comment?: string;
  author: string;
  quizName: string;
  reason?: string;
  date: Date;
  status: number;
  modifiedBy?: number;
}

export interface FlaggedCommentView extends FlaggedComments {
  quizCategory: string;
  userId: number;
}

export interface UpdateFlaggedCommentStatusRequest {
  id: number;
  status: number;
}
