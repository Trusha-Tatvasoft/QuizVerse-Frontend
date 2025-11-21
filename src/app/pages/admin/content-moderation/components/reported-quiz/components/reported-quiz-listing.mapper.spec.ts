import { colors } from '../../../../../../utils/constants';
import { severityLabels, statusLabels } from '../configs/reported-quiz.config';
import { QuizReportIssueResponseDTO } from '../interfaces/reported-quiz.interface';
import {
  reportedQuizToTableData,
  getSeverityColor,
  getStatusColor,
} from './reported-quiz-listing.mapper';
import {
  QuestionOrQuizIssueReportStatus,
  QuestionOrQuizIssueReportSeverity,
} from '../../../../../../shared/enums/content-moderation.enum';

// Strong type for mapped result
interface MappedTableData {
  id: number;
  quizId: number;
  quizTitle: string;
  creator: string;
  reporter: string;
  reason: string;
  severity: {
    tagConfig: {
      id: string;
      label: string;
      type: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  status: {
    tagConfig: {
      id: number;
      label: string;
      type: string;
      backgroundColor: string;
      textColor: string;
    };
  };
  actions: Array<{
    icon: string;
    tooltip: string;
    isDisabled: boolean;
    action: string | null;
  }>;
}

describe('reportedQuizToTableData', () => {
  const quiz: QuizReportIssueResponseDTO = {
    id: 10,
    quizId: 100,
    quizTitle: 'General Knowledge Quiz',
    creator: 'Admin',
    reporter: 'User1',
    reason: 'Incorrect information',
    severity: QuestionOrQuizIssueReportSeverity.High,
    status: QuestionOrQuizIssueReportStatus.Pending,
    createdDate: '2024-01-01',
    reviewedBy: 1,
    reviewer: 'User2',
  };

  const userId = 1;
  const isSuperAdmin = false;

  it('should map quiz object to TableData correctly', () => {
    const result = reportedQuizToTableData(
      quiz,
      userId,
      isSuperAdmin,
    ) as unknown as MappedTableData;

    expect(result.id).toBe(10);
    expect(result.quizTitle).toBe('General Knowledge Quiz');
    expect(result.creator).toBe('Admin');

    // severity
    expect(result.severity.tagConfig.label).toBe(severityLabels[quiz.severity]);
    expect(result.severity.tagConfig.backgroundColor).toBe(colors.red.bg);
    expect(result.severity.tagConfig.textColor).toBe(colors.red.text);

    // status
    expect(result.status.tagConfig.label).toBe(statusLabels[quiz.status]);
    expect(result.status.tagConfig.backgroundColor).toBe(colors.blue.bg); // PENDING = blue
    expect(result.status.tagConfig.textColor).toBe(colors.blue.text);

    expect(result.actions.length).toBe(4);
  });

  it('should enable "Mark Under Review" when status is pending', () => {
    const result = reportedQuizToTableData(
      { ...quiz, status: QuestionOrQuizIssueReportStatus.Pending },
      userId,
      isSuperAdmin,
    ) as unknown as MappedTableData;

    const action = result.actions[1];

    expect(action.isDisabled).toBe(false);
    expect(action.action).toBe('markUnderReview');
    expect(action.tooltip).toBe('Mark as Under Review');
  });

  it('should set revert action when status is underReview', () => {
    const result = reportedQuizToTableData(
      { ...quiz, status: QuestionOrQuizIssueReportStatus.UnderReview },
      userId,
      isSuperAdmin,
    ) as unknown as MappedTableData;

    const action = result.actions[1];

    expect(action.action).toBe('markPending');
    expect(action.tooltip).toBe('Revert to Pending');
  });

  it('should disable resolve action when status is accepted', () => {
    const result = reportedQuizToTableData(
      { ...quiz, status: QuestionOrQuizIssueReportStatus.Accepted },
      userId,
      isSuperAdmin,
    ) as unknown as MappedTableData;

    const action = result.actions[2];

    expect(action.isDisabled).toBe(true);
    expect(action.tooltip).toBe('Already Accepted');
  });

  it('should disable ignore action when status is ignore', () => {
    const result = reportedQuizToTableData(
      { ...quiz, status: QuestionOrQuizIssueReportStatus.Ignore },
      userId,
      isSuperAdmin,
    ) as unknown as MappedTableData;

    const action = result.actions[3];

    expect(action.isDisabled).toBe(true);
    expect(action.tooltip).toBe('Already Ignored');
  });
});

describe('getSeverityColor', () => {
  it('should return correct colors for severity levels', () => {
    expect(getSeverityColor(QuestionOrQuizIssueReportSeverity.High)).toBe(colors.red);
    expect(getSeverityColor(QuestionOrQuizIssueReportSeverity.Medium)).toBe(colors.yellow);
    expect(getSeverityColor(QuestionOrQuizIssueReportSeverity.Low)).toBe(colors.green);
    expect(getSeverityColor(999)).toBe(colors.black);
  });
});

describe('getStatusColor', () => {
  it('should return correct colors for status levels', () => {
    expect(getStatusColor(QuestionOrQuizIssueReportStatus.Accepted)).toBe(colors.green);
    expect(getStatusColor(QuestionOrQuizIssueReportStatus.Pending)).toBe(colors.blue);
    expect(getStatusColor(QuestionOrQuizIssueReportStatus.UnderReview)).toBe(colors.yellow);
    expect(getStatusColor(QuestionOrQuizIssueReportStatus.Ignore)).toBe(colors.orange);
  });

  it('should return white for unknown status', () => {
    expect(getStatusColor(999)).toBe(colors.white);
  });
});
