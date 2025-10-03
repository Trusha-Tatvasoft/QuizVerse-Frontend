import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export interface QuizResult {
  quizId: number;
  quizName: string;
  categoryName: string;
  difficultyLevel: string;
  score: number;
  attemptedOn: string;
}

export interface QuizResultWithTag {
  quizId: number;
  quizName: string;
  categoryName: string;
  difficultyLevel: string;
  score: number;
  attemptedOn: string;
  tag: TagInputConfig;
}
