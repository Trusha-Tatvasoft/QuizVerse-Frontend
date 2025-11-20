import { QuestionPoolListData } from './question-pool-list-data.interface';

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

export interface GenerateQuestionFromPromptRequest extends GenerateQuizRequest {
  prompt: string;
}

export interface ImportPreviewDialogData {
  questions: QuestionPoolListData[];
  isFromQuizCreation: boolean;
}
