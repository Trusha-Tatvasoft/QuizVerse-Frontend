import { VisitedQuestionStatus } from '../../../../shared/enums/quiz-attempt.enum';

export interface QuizInstructionsResponse {
  quizId: number;
  quizName: string;
  totalTime: number;
  totalQuestion: number;
  quizDifficultyName: string;
  quizCategoryName: string;
  isPaid: boolean;
  quizPrice?: number;
  description: string;
}

export interface QuizStartResponse {
  quizId: number;
  totalTime: number;
  totalQuestion: number;
  quizName: string;
  categoryName: string;
  quizQuestionId: number;
  questionType: string;
  questionName: string;
  options?: QuestionOptions[];
}

export interface QuizQuestions {
  questionId: number;
  questionTypeName: string;
  questionName: string;
  options?: QuestionOptions[];
}
export interface QuizQuestionResponse {
  quizQuestionId: number;
  questionType: string;
  questionName: string;
  options?: QuestionOptions[];
}

export interface QuestionOptions {
  optionId: number;
  key: string;
  value: string;
}

export interface SaveAndNextQuestionRequest {
  quizId: number;
  currentQuestionId: number;
  givenAnswer?: string;
  nextQuestionNumber: number; // change name to nextQuestionNumber
}

export interface VisitedQuestions {
  questionNo: number;
  questionId: number;
  questionTypeName: string;
  questionName: string;
  options?: QuestionOptions[];
  givenAnswer?: string;
  reviewStatus: VisitedQuestionStatus;
}

export interface SubmitQuizRequest {
  quizId: number;
  quizName: string;
  timeTaken: number;
  lastVisitedQuestionAndAnswers: {
    questionId: number;
    givenAnswer?: string;
  };
}

export interface SavedQuizState {
  quizId: number;
  currentQuestionIndex: number;
  remainingSeconds: number;
  visitedQuestions: VisitedQuestions[];
  quizStartData: QuizStartResponse;
  currentQuestionData: QuizQuestions;
  timestamp: number;
}
