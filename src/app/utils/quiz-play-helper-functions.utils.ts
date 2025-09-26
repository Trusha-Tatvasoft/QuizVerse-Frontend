import {
  QuizQuestions,
  VisitedQuestions,
} from '../pages/user/quiz-attempt-layout/interfaces/quiz-attempt.interface';
import { VisitedQuestionStatus } from '../shared/enums/quiz-attempt.enum';

export function getQuestionNosGivenAnswer(
  visitedQuestions: VisitedQuestions[],
  questionNo: number,
): string {
  const visited = visitedQuestions.find((vq) => vq.questionNo === questionNo);
  return visited?.givenAnswer ?? '';
}

export function getQuestionsCountByStatus(
  visitedQuestions: VisitedQuestions[],
  status: VisitedQuestionStatus,
): number {
  if (status === VisitedQuestionStatus.answered) {
    return visitedQuestions.filter(
      (v) =>
        v.reviewStatus === status ||
        (v.givenAnswer !== '' && v.reviewStatus !== VisitedQuestionStatus.saved),
    ).length;
  }
  return visitedQuestions.filter((v) => v.reviewStatus === status).length;
}

export function getQuestionStatus(
  visitedQuestions: VisitedQuestions[],
  idx: number,
  status?: VisitedQuestionStatus,
): boolean {
  const question = visitedQuestions.find((v) => v.questionNo === idx + 1);
  if (!question) return false;

  return status ? question.reviewStatus === status : true;
}

// Mark a question as visited / answered
export function markVisited(
  visitedQuestions: VisitedQuestions[],
  question: QuizQuestions,
  givenAnswer: string,
  currentQuestionNo: number,
): VisitedQuestions[] {
  const questionNo = currentQuestionNo;
  const existing = visitedQuestions.find((q) => q.questionId === question.questionId);

  if (existing) {
    existing.givenAnswer = givenAnswer;
    existing.reviewStatus =
      existing.reviewStatus !== VisitedQuestionStatus.marked_for_review
        ? givenAnswer === ''
          ? VisitedQuestionStatus.visited
          : VisitedQuestionStatus.answered
        : VisitedQuestionStatus.marked_for_review;
  } else {
    visitedQuestions.push({
      questionNo,
      questionId: question.questionId,
      questionTypeName: question.questionTypeName,
      questionName: question.questionName,
      options: question.options,
      givenAnswer,
      reviewStatus:
        givenAnswer === '' ? VisitedQuestionStatus.visited : VisitedQuestionStatus.answered,
    });
  }
  return visitedQuestions;
}

// Mark / unmark a question for review
export function markForReviewQuestion(
  visitedQuestions: VisitedQuestions[],
  questionNo: number,
  currentQuestionData: QuizQuestions,
): VisitedQuestions[] {
  const thisQuestion = visitedQuestions.find((vq) => vq.questionNo === questionNo);

  if (thisQuestion) {
    thisQuestion.reviewStatus =
      thisQuestion.reviewStatus !== VisitedQuestionStatus.marked_for_review
        ? VisitedQuestionStatus.marked_for_review
        : thisQuestion.givenAnswer === ''
          ? VisitedQuestionStatus.visited
          : VisitedQuestionStatus.answered;
  } else {
    visitedQuestions.push({
      questionNo,
      questionId: currentQuestionData.questionId,
      questionTypeName: currentQuestionData.questionTypeName,
      questionName: currentQuestionData.questionName,
      options: currentQuestionData.options,
      givenAnswer: '',
      reviewStatus: VisitedQuestionStatus.marked_for_review,
    });
  }

  return visitedQuestions;
}
