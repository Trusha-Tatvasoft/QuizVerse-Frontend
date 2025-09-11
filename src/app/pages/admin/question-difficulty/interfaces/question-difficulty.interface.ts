// DTO for question difficulty level response from the server.
export interface QuestionDifficultyResponseDTO {
  id: number;
  name: string;
  description: string;
  xpGained: number;
  totalQuestions: number;
}

// DTO for creating or updating question difficulty levels.
export interface QuestionDifficultyRequestDTO {
  id?: number;
  name: string;
  description: string;
  xpGainedPerQuestion: number;
}
