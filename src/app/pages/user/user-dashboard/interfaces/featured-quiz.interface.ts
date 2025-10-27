import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export interface FeaturedQuiz {
  quizId: number;
  quizName: string;
  categoryName: string;
  difficultyLevel: string;
  totalAttempts: number;
  rating: string;
  isAttempted: boolean;
}

export interface FeaturedQuizList {
  quizzes: FeaturedQuiz[];
  hasMore: boolean;
}

export interface FeaturedQuizWithTag {
  quizId: number;
  quizName: string;
  categoryName: string;
  difficultyLevel: string;
  totalAttempts: number;
  rating: string;
  isAttempted: boolean;
  tag: TagInputConfig;
}
