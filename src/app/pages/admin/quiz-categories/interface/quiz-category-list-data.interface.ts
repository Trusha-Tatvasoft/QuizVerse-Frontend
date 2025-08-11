export interface QuizCategoryList {
  id: number;
  categoryName: string;
  description: string;
  icon?: string | null;
  isActive: boolean;
  createdDate: string;
  quizCount: number;
}
