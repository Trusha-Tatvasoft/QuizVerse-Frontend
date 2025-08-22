import { TagInputConfig } from './tag-component.interface';

//questions for paginated question pool list
export interface QuestionPoolList {
  id: number;
  categoryId: number;
  categoryName: string;
  queDifficultyId: number;
  queDifficultyName: string;
  queText: string;
  queTypeId: number;
  queTypeName: string;
  queOptionsAnsJson?: string;
  queOptionsAns: QueOptionsAndAnswers[];
}

export interface QueOptionsAndAnswers {
  id?: number;
  questionId?: number;
  key: string;
  value: string;
}

export interface QuestionsList {
  id?: number;
  categoryId?: number;
  queDifficultyId?: number;
  queDifficultyName?: string;
  queText: string;
  queTypeId?: number;
  queTypeName?: string;
  queOptionsAns?: QueOptionsAndAnswers[];
}

//for send data to backend
export interface SaveQuizRequest {
  id?: number;
  name: string;
  categoryId: number;
  description: string;
  totalTime: number;
  difficultyLevelId: number;
  totalQuestion: number;
  isPaid: boolean;
  price?: number;
  status?: number;
  tags?: TagsList[];
  questions?: QuestionsListRequest[];
  noOfQuestionsPerDifficulty: { queDifficultyName: string; noOfQuestions: number }[];
}

export interface TagsList {
  id?: number;
  name: string;
}

export interface QuestionsListRequest {
  id?: number;
  categoryId: number;
  queDifficultyId: number;
  queText: string;
  queTypeId: number;
  queOptionsAns?: QueOptionsAndAnswers[];
}

//fetch quiz data from db
export interface QuizResponse {
  id?: number;
  name: string;
  categoryId: number;
  description: string;
  totalTime: number;
  difficultyLevelId: number;
  totalQuestion: number;
  isPaid: boolean;
  price?: number;
  status: number;
  tags?: TagsList[];
  questions?: QuestionResponseDto[];
  noOfQuestionsPerDifficulty: { queDifficultyName: string; noOfQuestions: number }[];
}

export interface QuestionResponseDto {
  id: number;
  categoryId: number;
  queDifficultyId: number;
  queText: string;
  queTypeId: number;
  queOptionsAns: QuestionOptionResponseDto[];
}

export interface QuestionOptionResponseDto {
  id: number;
  questionId: number;
  key: string;
  value: string;
}

//step 1 data in quiz creation
export interface QuizStep1Data {
  quizTitle: string;
  quizCategory: number;
  quizCategoryName?: string;
  description: string;
  quizTiming: number;
  difficultyLevel: number;
  isPaid: boolean;
  price?: number;
  totalQuestions: number;
  tags: string[];
  difficultyDistribution?: { key: string; value: number }[];
}

//for model of quiz preview
export interface QuizPreviewData {
  quizName: string;
  description: string;
  tags: TagInputConfig[];
  questions: QuestionsList[];
}

//export csv
export interface ExportQuizQuestionsRequestDto {
  quizName: string;
  questions: QuestionsListRequest[];
}
