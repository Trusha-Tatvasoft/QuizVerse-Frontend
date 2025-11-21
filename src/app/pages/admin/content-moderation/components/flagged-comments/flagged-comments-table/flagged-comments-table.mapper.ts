import {
  QuestionOrQuizIssueReportSeverity,
  QuestionOrQuizIssueReportStatus,
  QuizRatingStatus,
} from '../../../../../../shared/enums/content-moderation.enum';
import { TableData } from '../../../../../../shared/interfaces/table-component.interface';
import { colors, flaggedCommentsAction } from '../../../../../../utils/constants';
import { FlaggedComments } from '../../../interfaces/flagged-comments.interface';

/**
 * Returns a list of available actions for a reported question based on its status.
 */
function getQuestionActions(status: number) {
  const s = QuizRatingStatus;

  const isFinalState = status === s.Accepted || status === s.Ignore;

  // ---- Tooltip and Action helper logic ----

  const getCheckTooltip = (): string => {
    if (status === s.Accepted) return 'Already Accepted';
    if (status === s.Ignore) return 'Already Ignored';
    if (status === s.Pending) return 'Accept Report';
    return 'Accept Report';
  };

  const getBlockTooltip = (): string => {
    if (status === s.Accepted) return 'Already Accepted';
    if (status === s.Ignore) return 'Already Ignored';
    if (status === s.Pending) return 'Ignore Report';
    return 'Ignore Report';
  };

  // ---- Build action list ----
  return [
    {
      icon: flaggedCommentsAction.VIEW,
      tooltip: 'View Details',
      isDisabled: false,
    },
    {
      icon: flaggedCommentsAction.ACCEPTED,
      tooltip: getCheckTooltip(),
      isDisabled: isFinalState,
    },
    {
      icon: flaggedCommentsAction.IGNORED,
      tooltip: getBlockTooltip(),
      isDisabled: isFinalState,
    },
  ];
}

/**
 * Maps a `Flagged Comments` object to a `TableData` object for the Reported Questions table.
 */
export function flaggedCommentsToTableData(comment: FlaggedComments): TableData {
  const truncatedComment =
    comment.comment!.length > 40 ? comment.comment!.slice(0, 40) + '…' : comment.comment;

  return {
    id: comment.id,
    comment: truncatedComment,
    author: comment.author,
    quizName: comment.quizName,
    reason: comment.reason,
    date: new Date(comment.date).toLocaleDateString(),
    status: {
      tagConfig: {
        id: comment.status.toString(),
        label: getStatusLabel(comment.status),
        type: 'static',
        backgroundColor: getStatusColor(comment.status).bg,
        textColor: getStatusColor(comment.status).text,
      },
    },
    actions: getQuestionActions(comment.status),
  };
}

/**
 * Maps a numeric status to a readable label.
 */
export function getStatusLabel(status: number): string {
  const s = QuizRatingStatus;
  switch (status) {
    case s.Accepted:
      return 'Accepted';
    case s.Ignore:
      return 'Ignored';
    case s.Pending:
      return 'Pending';
    case s.UnderProcessing:
      return 'Under Processing';
    default:
      return 'Unknown';
  }
}

/**
 * Maps a numeric status to background and text colors.
 */
export function getStatusColor(status: number): { bg: string; text: string } {
  const s = QuizRatingStatus;
  switch (status) {
    case QuizRatingStatus.Accepted:
      return colors.green;
    case QuizRatingStatus.Pending:
      return colors.blue;
    case QuizRatingStatus.Ignore:
      return colors.red;
    case QuizRatingStatus.UnderProcessing:
      return colors.yellow;
    default:
      return colors.black;
  }
}
