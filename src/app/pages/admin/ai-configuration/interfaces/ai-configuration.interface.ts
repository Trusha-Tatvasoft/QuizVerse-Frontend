export interface AIConfigurationSummary {
  curruntMonthApiCalls: number;
  generatedQuestionsCurruntMonth: number;
  generatedQuestionsLastMonth: number;
  successRate: number;
}

export interface AiUsesDetails {
  todaysApiCalls: number;
  averageResponseTimeInSecond: number;
  errorRate: number;
}
