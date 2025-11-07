export interface QuizCommentsResponse {
  comments: QuizComments[];
  hasMoreComments: boolean;
}

export interface QuizComments {
  userName: string;
  fullName: string;
  profilePic?: string | null;
  commentText?: string;
  rating: number;
  commentDate: Date;
  isUser: boolean;
}
