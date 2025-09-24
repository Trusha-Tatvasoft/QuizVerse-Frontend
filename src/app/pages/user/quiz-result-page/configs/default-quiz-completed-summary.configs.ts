import { QuizCompletedSummary } from '../interfaces/quiz-completed-summary.interface';

export const defaultQuizCompletedSummary: QuizCompletedSummary = {
  quizName: 'N/A',
  totalQuestions: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  scorePercentage: 0,
  grade: 'N/A',
  timeSpent: '00:00:00', // TimeSpan comes as string from backend
  xpEarned: 0,
};
