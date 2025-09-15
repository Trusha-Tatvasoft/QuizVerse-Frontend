export interface QuizQuestionReview {
  questionId: number;
  questionText: string;
  userAnswer?: string | null;
  correctAnswer: string;
  isCorrect?: boolean | null;
}

export interface QuizQuestionReviewExtended extends QuizQuestionReview {
  loadingExplanation?: boolean;
  showExplanation?: boolean;
  explanation?: string;
}
