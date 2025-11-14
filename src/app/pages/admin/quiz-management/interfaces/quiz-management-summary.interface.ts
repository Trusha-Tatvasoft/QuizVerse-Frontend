export interface QuizManagementSummary {
  totalQuiz: number;
  totalParticipants: number;
  activeQuiz: number;
  totalQuestions: number;
}

export interface AIGenerationOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}
