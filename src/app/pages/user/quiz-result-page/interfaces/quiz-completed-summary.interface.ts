export interface QuizCompletedSummary {
  quizName: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  scorePercentage: number;
  grade: string;
  timeSpent: string; // TimeSpan from C# will come as string (e.g. "00:12:34")
  xpEarned: number;
}
