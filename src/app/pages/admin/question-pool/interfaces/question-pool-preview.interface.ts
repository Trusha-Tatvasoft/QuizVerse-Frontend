export interface QuestionDetail {
  id: number;
  questionText: string;
  questionType: string;
  difficulty: string;
  category: string;
  options: QuestionOption[] | null;
  correctAnswer: string;
}

export interface QuestionOption {
  label: string;
  value: string;
  isCorrect: boolean;
}
