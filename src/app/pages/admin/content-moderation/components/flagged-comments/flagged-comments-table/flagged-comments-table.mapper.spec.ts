import { QuizRatingStatus } from '../../../../../../shared/enums/content-moderation.enum';
import { colors, flaggedCommentsAction } from '../../../../../../utils/constants';
import {
  flaggedCommentsToTableData,
  getStatusColor,
  getStatusLabel,
} from './flagged-comments-table.mapper';

describe('Flagged Comments Utils', () => {
  describe('getStatusLabel', () => {
    it('should return correct label for each status', () => {
      expect(getStatusLabel(QuizRatingStatus.Accepted)).toBe('Accepted');
      expect(getStatusLabel(QuizRatingStatus.Ignore)).toBe('Ignored');
      expect(getStatusLabel(QuizRatingStatus.Pending)).toBe('Pending');
      expect(getStatusLabel(QuizRatingStatus.UnderProcessing)).toBe('Under Processing');
    });

    it('should return "Unknown" for an invalid status', () => {
      expect(getStatusLabel(999)).toBe('Unknown');
    });
  });

  describe('getStatusColor', () => {
    it('should return correct color for each status', () => {
      expect(getStatusColor(QuizRatingStatus.Accepted)).toEqual(colors.green);
      expect(getStatusColor(QuizRatingStatus.Ignore)).toEqual(colors.red);
      expect(getStatusColor(QuizRatingStatus.Pending)).toEqual(colors.blue);
      expect(getStatusColor(QuizRatingStatus.UnderProcessing)).toEqual(colors.yellow);
    });

    it('should return black for an unknown status', () => {
      expect(getStatusColor(999)).toEqual(colors.black);
    });
  });

  describe('flaggedCommentsToTableData', () => {
    const baseComment = {
      id: 1,
      comment: 'This is a test comment for moderation',
      author: 'Test User',
      quizName: 'Sample Quiz',
      reason: 'Offensive content',
      date: new Date('2024-10-10'),
      status: QuizRatingStatus.Pending,
    };

    it('should map flagged comment to table data correctly', () => {
      const result = flaggedCommentsToTableData(baseComment) as any;
      expect(result['id']).toBe(1);
      expect(result['author']).toBe('Test User');
      expect(result['quizName']).toBe('Sample Quiz');
      expect(result['reason']).toBe('Offensive content');
      expect(result['status']).toBeDefined();
      expect(result['actions'].length).toBe(3);
    });

    it('should truncate long comments with an ellipsis', () => {
      const longComment = { ...baseComment, comment: 'A'.repeat(100) };
      const result = flaggedCommentsToTableData(longComment) as any;
      expect(result['comment'].endsWith('…')).toBe(true);
      expect(result['comment'].length).toBeLessThan(100);
    });

    it('should not truncate short comments', () => {
      const shortComment = { ...baseComment, comment: 'Short comment' };
      const result = flaggedCommentsToTableData(shortComment);
      expect(result['comment']).toBe('Short comment');
    });

    it('should correctly assign status label and colors', () => {
      const acceptedComment = { ...baseComment, status: QuizRatingStatus.Accepted };
      const result = flaggedCommentsToTableData(acceptedComment) as any;
      expect(result['status']['tagConfig']['label']).toBe('Accepted');
      expect(result['status']['tagConfig']['backgroundColor']).toBe(colors.green.bg);
      expect(result['status']['tagConfig']['textColor']).toBe(colors.green.text);
    });

    it('should disable Accept and Ignore buttons when status is Accepted', () => {
      const comment = { ...baseComment, status: QuizRatingStatus.Accepted };
      const result = flaggedCommentsToTableData(comment) as any;
      const actions = result['actions'];

      expect(actions[1]['isDisabled']).toBe(true);
      expect(actions[2]['isDisabled']).toBe(true);
      expect(actions[1]['tooltip']).toBe('Already Accepted');
      expect(actions[2]['tooltip']).toBe('Already Accepted');
    });

    it('should disable Accept and Ignore buttons when status is Ignored', () => {
      const comment = { ...baseComment, status: QuizRatingStatus.Ignore };
      const result = flaggedCommentsToTableData(comment) as any;
      const actions = result['actions'];

      expect(actions[1]['isDisabled']).toBe(true);
      expect(actions[2]['isDisabled']).toBe(true);
      expect(actions[1]['tooltip']).toBe('Already Ignored');
      expect(actions[2]['tooltip']).toBe('Already Ignored');
    });

    it('should enable Accept and Ignore buttons when status is Pending', () => {
      const comment = { ...baseComment, status: QuizRatingStatus.Pending };
      const result = flaggedCommentsToTableData(comment) as any;
      const actions = result['actions'];

      expect(actions[1]['isDisabled']).toBe(false);
      expect(actions[2]['isDisabled']).toBe(false);
      expect(actions[1]['tooltip']).toBe('Accept Report');
      expect(actions[2]['tooltip']).toBe('Ignore Report');
    });

    it('should correctly handle UnderProcessing status', () => {
      const comment = { ...baseComment, status: QuizRatingStatus.UnderProcessing };
      const result = flaggedCommentsToTableData(comment) as any;
      expect(result['status']['tagConfig']['label']).toBe('Under Processing');
      expect(result['status']['tagConfig']['backgroundColor']).toBe(colors.yellow.bg);
    });

    it('should correctly map date to a formatted string', () => {
      const result = flaggedCommentsToTableData(baseComment);
      expect(typeof result['date']).toBe('string');
      expect(result['date']).toContain('10');
    });

    it('should assign proper icons for actions', () => {
      const result = flaggedCommentsToTableData(baseComment) as any;
      const icons = result['actions'].map((a: any) => a['icon']);
      expect(icons).toContain(flaggedCommentsAction.VIEW);
      expect(icons).toContain(flaggedCommentsAction.ACCEPTED);
      expect(icons).toContain(flaggedCommentsAction.IGNORED);
    });
  });
});
