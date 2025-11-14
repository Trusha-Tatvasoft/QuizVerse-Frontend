export interface QuizQuestionReview {
  questionId: number;
  questionText: string;
  userAnswer?: string | null;
  correctAnswer: string;
  isCorrect?: boolean | null;
  reportId: number | null;
  isEditable: boolean;
}

export interface QuizQuestionReviewExtended extends QuizQuestionReview {
  loadingExplanation?: boolean;
  showExplanation?: boolean;
  explanation?: string;
}

export interface QuestionIssueReportRequest {
  quizId: number;
  questionId: number;
  description: string;
  reportId: number | null;
}

export interface ReportQuestionDialogData {
  questionId: number;
  questionText: string;
  reportId: number | null;
  isEditable: boolean;
  description: string | null;
}
