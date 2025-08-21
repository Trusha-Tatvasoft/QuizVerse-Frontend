export interface QuestionRequest {
  questionTypeId: number;
  categoryId: number;
  difficultyId: number;
  questionText: string;
  options?: string[];
  correctAnswer: string;
}
