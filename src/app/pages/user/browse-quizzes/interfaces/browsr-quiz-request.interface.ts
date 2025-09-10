import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

export interface BrowseQuizzesRequest {
  searchText?: string;
  batchNumber: number;
  quizCategoryId?: number | null;
  quizDifficultyLevelId?: number | null;
  browseQuizzesSorting?: number | null;
  browseQuizzesFilterByType?: number | null;
  filterRanges: {
    minPrice: number;
    maxPrice: number;
    minRating: number;
    maxRating: number;
    minTotalTime: number;
    maxTotalTime: number;
  };
  tags?: number[] | null;
}

export interface QuizCardConfig {
  id: number;
  title: string;
  description: string;
  category: TagInputConfig;
  difficulty: TagInputConfig;
  priceTag?: TagInputConfig;
  tags?: TagInputConfig[];
  duration: string;
  questions: number;
  participants: number;
  rating: number;
  isFeatured: boolean;
  isPaid: boolean;
  isAttempted: boolean;
  buttonConfig: ButtonConfig;
}
