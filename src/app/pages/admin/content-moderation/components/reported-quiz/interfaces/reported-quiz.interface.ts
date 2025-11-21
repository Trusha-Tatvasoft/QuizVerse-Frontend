import { QuizPreviewData } from '../../../../../../shared/interfaces/quiz-creation.interface';

export interface QuizReportIssueResponseDTO {
  id: number;
  quizId: number;
  quizTitle: string;
  creator: string;
  reporter: string;
  reason: string;
  severity: number;
  status: number;
  createdDate: string;
  reviewedBy: number;
  reviewer: string;
}

export interface QuizReportPreviewData {
  quiz: QuizPreviewData;
  report: QuizReportIssueResponseDTO; // Your report data
}
