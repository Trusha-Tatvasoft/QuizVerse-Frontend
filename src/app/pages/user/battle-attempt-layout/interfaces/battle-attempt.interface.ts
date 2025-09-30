// battle instruction
export interface BattleInstruction {
  battleAttemptId: number;
  battleName: string;
  battleDescription: string;
  battleCategory: string;
  timeInSeconds: number; // same as BE
}

// player details at battle start
export interface PlayerProfileDto {
  userId: number;
  userName: string;
  fullName: string;
  currentLevel: number;
  winRate: number;
  profilePic: string;
}

export interface BattleStartDetails {
  battleAttemptId: number;
  playerProfile: PlayerProfileDto;
  opponentProfile: PlayerProfileDto;
  totalQuestions: number;
}

// play battle
export interface BattleQuestion {
  questionIndex: number;
  quizQuestionId: number;
  questionName: string;
  questionType: string;
  options?: BattleQuestionOption[];
  timeInSeconds: number;
}

export interface BattleQuestionOption {
  key: string;
  value: string;
}

// score dto
export interface ScoreChangedDto {
  battleAttemptId: number;
  player1Score: number;
  player2Score: number;
  player1Id: number;
  player2Id: number;
  player1CurrentIndex: number;
  player2CurrentIndex: number;
  player1CorrectedAns: number;
  player2CorrectedAns: number;
}

export interface LastAnswerdQuestionDetail {
  questionIndex: number;
  isCorrect: boolean;
  xpGained: number;
  correctAnswer: string;
}
