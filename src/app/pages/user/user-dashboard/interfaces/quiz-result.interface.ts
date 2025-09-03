import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export interface QuizResult {
  quizName: string;
  categoryName: string;
  difficultyLevel: string;
  score: number;
  attemptedOn: string;
}

export interface QuizResultWithTag {
  quizName: string;
  categoryName: string;
  difficultyLevel: string;
  score: number;
  attemptedOn: string;
  tag: TagInputConfig;
}
