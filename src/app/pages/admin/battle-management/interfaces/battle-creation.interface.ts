import { TagInputConfig } from '../../../../shared/interfaces/tag-component.interface';

//for send data to backend
export interface SaveBattleRequest {
  id?: number;
  name: string;
  description: string;
  difficultyLevelId: number;
  categoryId: number;
  status?: number;
  battleType: number;
  startDate?: string | null;
  endDate?: string | null;
  totalTime: number;
  totalQuestion: number;
  totalXp: number;
  questions?: QuestionsListRequest[];
  questionsDifficulty: BattleQuestionDifficulty[];
}

export interface QuestionsListRequest {
  id?: number;
  categoryId: number;
  queDifficultyId: number;
  queText: string;
  queTypeId: number;
  queOptionsAns?: QueOptionsAndAnswers[];
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

//fetch battle data from db
export interface BattleResponse {
  id?: number;
  name: string;
  description: string;
  battleType: number;
  startDate: Date;
  endDate: Date;
  totalTime: number;
  totalQuestion: number;
  totalXp: number;
  status?: number;
  difficultyLevelId: number;
  categoryId: number;
  questions?: QuestionResponseDto[];
  questionsDifficulty: BattleQuestionDifficulty[];
}

export interface QuestionResponseDto {
  id: number;
  categoryId: number;
  queDifficultyId: number;
  queText: string;
  queTypeId: number;
  queOptionsAns: QueOptionsAndAnswers[];
}

export interface BattleQuestionDifficulty {
  id?: number;
  queDifficultyId: number;
  noOfQues: number;
  timePerQuestion: number;
}

export interface QuestionDifficultyXP {
  questionDifficultyId: number;
  questionDifficultyName: string;
  xpGained: number;
}

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

// step 1 data in battle creation
export interface BattleStep1Data {
  id?: number;
  name: string;
  description: string;
  difficultyLevelId: number;
  difficultyLevelName?: string;
  categoryId: number;
  battleCategoryName?: string;
  status?: number;
  battleType: number;
  battleTypeName?: string;
  startDate: Date;
  endDate: Date;
  totalTime: number;
  totalQuestion: number;
  totalXp: number;
  questionsDifficulty: BattleQuestionDifficulty[];
}

//for model of quiz preview
export interface BattlePreviewData {
  name: string;
  description: string;
  tags: TagInputConfig[];
  questions: QuestionsList[];
  questionsDifficulty: BattleQuestionDifficulty[];
  questionDifficultyXP: QuestionDifficultyXP[];
}
