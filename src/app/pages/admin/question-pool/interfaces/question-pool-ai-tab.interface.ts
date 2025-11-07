export interface GenerateQuizRequest {
  categoryId?: number;
  category?: string;
  questionSpec: QuestionGenerationFormat[];
}

export interface QuestionGenerationFormat {
  questionDifficultyId: number;
  questionDifficultyName: string;
  questionPerQuestionType: QuestionPerQuestionType[];
}

export interface QuestionPerQuestionType {
  questionPerQuestionTypeId: number;
  questionPerQuestionTypeName: string;
  noOfQuesitons: number;
}

export interface GenerateQuizFromPDFRequest extends GenerateQuizRequest {
  prompt: File;
}

export interface GenerateQuestionFromWebUrlRequest extends GenerateQuizRequest {
  url: string;
}
