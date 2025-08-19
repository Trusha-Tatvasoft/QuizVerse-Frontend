export interface QuizCategoryList {
  id: number;
  categoryName: string;
  description: string;
  icon?: string | null;
  isActive: boolean;
  createdDate: string;
  quizCount: number;
}

export interface SaveQuizCategory {
  id?: number;
  categoryName: string;
  description: string;
  icon?: string | null;
}
