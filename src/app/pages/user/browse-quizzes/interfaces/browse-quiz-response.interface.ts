export interface BrowseQuizResponse {
  id: number;
  name: string;
  description: string;
  isPaid: boolean;
  price: number;
  categoryName: string;
  difficultyLevel: string;
  isFeatured: boolean;
  tags: string[];
  totalTime: number;
  totalQuestions: number;
  totalParticipates: number;
  rating: number;
  isAttempted: boolean;
  report: QuizReport;
}

export interface QuizReport {
  reportId: number;
  reportReason: string;
  isEditable: boolean;
}

export interface BrowseQuizzesApiResponse {
  quizzes: BrowseQuizResponse[];
  hasMore: boolean;
  totalFeatured: number;
  totalFree: number;
  totalPremium: number;
  totalAll: number;
}
