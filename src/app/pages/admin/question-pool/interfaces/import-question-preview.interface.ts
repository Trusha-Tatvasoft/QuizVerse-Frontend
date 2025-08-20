export interface QueOptionsAndAnsDto {
  id: number;
  question_id: number;
  key: string;
  value: string;
}

export interface QuestionPoolListDataDto {
  id: number;
  category_id: number;
  category_name: string;
  que_difficulty_id: number;
  que_difficulty_name: string;
  que_text: string;
  que_type_id: number;
  que_type_name: string;
  que_options_ans: QueOptionsAndAnsDto[];
}
