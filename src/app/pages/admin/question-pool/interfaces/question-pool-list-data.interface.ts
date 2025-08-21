export interface QueOptionsAndAns {
  id: number;
  questionId: number;
  key: string;
  value: string;
}

export interface QuestionPoolListData {
  id: number;
  categoryId: number;
  categoryName: string;
  queDifficultyId: number;
  queDifficultyName: string;
  queText: string;
  queTypeId: number;
  queTypeName: string;
  queOptionsAns: QueOptionsAndAns[];
}
