import {
  QuestionOrQuizIssueReportSeverity,
  QuestionOrQuizIssueReportStatus,
} from '../../../../../../shared/enums/content-moderation.enum';
import { TableData } from '../../../../../../shared/interfaces/table-component.interface';
import { colors } from '../../../../../../utils/constants';
import { severityLabels, statusLabels } from '../configs/reported-quiz.config';
import { QuizReportIssueResponseDTO } from '../interfaces/reported-quiz.interface';

function getQuizActions(status: number, reviewedBy: number, userId: number, isSuperAdmin: boolean) {
  const s = QuestionOrQuizIssueReportStatus;

  const canModify = isSuperAdmin || reviewedBy === userId;
  const isFinalState =
    status === s.Accepted || status === s.Ignore || (status === s.UnderReview && !canModify);

  return [
    {
      icon: 'visibility',
      tooltip: 'View Details',
      isDisabled: false,
      action: 'view',
    },
    {
      icon: status === s.Pending ? 'bookmark_added' : 'hourglass_empty',
      tooltip:
        !canModify && status === s.UnderReview
          ? 'Only the reviewer or admin can Accepted'
          : status === s.Pending
            ? 'Mark as Under Review'
            : status === s.UnderReview
              ? 'Revert to Pending'
              : status === s.Accepted
                ? 'Mark as Accepted'
                : status === s.Ignore
                  ? 'Mark as Ignored'
                  : 'Mark as Under Review',
      isDisabled: isFinalState,
      action:
        status === s.Pending ? 'markUnderReview' : status === s.UnderReview ? 'markPending' : null,
    },
    {
      icon: 'check_circle',
      tooltip:
        status === s.Accepted
          ? 'Already Accepted'
          : status === s.Ignore
            ? 'Mark as Ignored'
            : status === s.UnderReview && !canModify
              ? 'Only the reviewer or admin can Accepted'
              : 'Mark as Accepted',
      isDisabled: isFinalState,
      action: status === s.Accepted ? null : 'accept',
    },
    {
      icon: 'block',
      tooltip:
        status === s.Ignore
          ? 'Already Ignored'
          : status === s.Accepted
            ? 'Mark as Accepted'
            : status === s.UnderReview && !canModify
              ? 'Only the reviewer or admin can ignore'
              : 'Ignore Report',
      isDisabled: isFinalState,
      action: status === s.Ignore ? null : 'ignore',
    },
  ];
}

export function reportedQuizToTableData(
  quiz: QuizReportIssueResponseDTO,
  userId: number,
  isSuperAdmin: boolean,
): TableData {
  return {
    id: quiz.id,
    quizId: quiz.quizId,
    quizTitle: quiz.quizTitle,
    creator: quiz.creator,
    reporter: quiz.reporter,
    reason: quiz.reason,
    severity: {
      tagConfig: {
        id: quiz.id.toString(),
        label: severityLabels[quiz.severity],
        type: 'static',
        backgroundColor: getSeverityColor(quiz.severity).bg,
        textColor: getSeverityColor(quiz.severity).text,
      },
    },
    status: {
      tagConfig: {
        id: quiz.status,
        label: statusLabels[quiz.status],
        type: 'static',
        backgroundColor: getStatusColor(quiz.status).bg,
        textColor: getStatusColor(quiz.status).text,
      },
    },
    actions: getQuizActions(quiz.status, quiz.reviewedBy, userId, isSuperAdmin),
  };
}

export function getSeverityLabel(severity: number): string {
  switch (severity) {
    case QuestionOrQuizIssueReportSeverity.High:
      return 'High';
    case QuestionOrQuizIssueReportSeverity.Medium:
      return 'Medium';
    case QuestionOrQuizIssueReportSeverity.Low:
      return 'Low';
    default:
      return 'Unknown';
  }
}

export function getSeverityColor(severity: number): { bg: string; text: string } {
  switch (severity) {
    case QuestionOrQuizIssueReportSeverity.High:
      return colors.red;
    case QuestionOrQuizIssueReportSeverity.Medium:
      return colors.yellow;
    case QuestionOrQuizIssueReportSeverity.Low:
      return colors.green;
    default:
      return colors.black;
  }
}

export function getStatusLabel(status: number): string {
  const s = QuestionOrQuizIssueReportStatus;
  switch (status) {
    case s.Accepted:
      return 'Accepted';
    case s.Ignore:
      return 'Ignored';
    case s.Pending:
      return 'Pending';
    case s.UnderReview:
      return 'Under Review';
    default:
      return 'Unknown';
  }
}

export function getStatusColor(status: number): { bg: string; text: string } {
  const s = QuestionOrQuizIssueReportStatus;
  switch (status) {
    case s.Accepted:
      return colors.green;
    case s.Ignore:
      return colors.orange;
    case s.Pending:
      return colors.blue;
    case s.UnderReview:
      return colors.yellow;
    default:
      return colors.white;
  }
}
