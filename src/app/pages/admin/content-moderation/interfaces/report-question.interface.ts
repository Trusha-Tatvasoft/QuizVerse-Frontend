import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';
import { QuestionDetail } from '../../question-pool/interfaces/question-pool-preview.interface';

export interface ReportQuestion {
  id: number;
  questionId: number;
  question: string;
  creator: string;
  reporter: string;
  reason: string;
  severity: number;
  status: number;
  markAsReviewBy: number | null;
  createdDate: string;
}

export interface ReportQuestionPreviewData {
  reportId: number;
  questionId: number;
  reason: string;
  severity: number;
  status: number;
}

export interface QuestionDetailCount {
  activeQuizContainCount: number;
  activeBattleContainCount: number;
}

export interface QuestionDetailExtended extends QuestionDetailCount {
  questionDetail: QuestionDetail;
}

export interface ActiveQuizBattleAffectedDTO {
  id: number;
  quizTitle: string;
  categoryName: string;
  quizDifficultyLevel: string;
  totalQuestion: number;
  type: number;
}

export interface AffectedQuizBattleItemDisplayDTO {
  id: number;
  quizTitle: string;
  typeLabel: string;
  difficultyTag: TagInputConfig;
  totalQuestionTag: TagInputConfig;
}

export interface AffectedQuizBattleTypeGroup {
  typeLabel: string;
  items: AffectedQuizBattleItemDisplayDTO[];
}

export interface AffectedQuizBattleCategoryGroup {
  categoryName: string;
  types: AffectedQuizBattleTypeGroup[];
}
