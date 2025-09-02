import { emailTemplateToTableData } from './email-template.component.mapper';
import { EmailTemplatesResponseDto } from './configs/email-template.component.config';
import { colors, emailTemplateTypeLabels } from '../../../utils/constants';

describe('emailTemplateToTableData', () => {
  it('should map EmailTemplatesResponseDto to TableData (active template)', () => {
    const dto: EmailTemplatesResponseDto = {
      id: 1,
      title: 'Welcome Template',
      subject: 'Welcome Subject',
      templateType: 0,
      status: true,
      body: null,
    };

    const result: any = emailTemplateToTableData(dto);

    expect(result.id).toBe(dto.id);
    expect(result.title).toBe(dto.title);
    expect(result.subject).toBe(dto.subject);

    // templateType mapping
    expect(result.templateType.tagConfig.id).toBe(dto.templateType.toString());
    expect(result.templateType.tagConfig.label).toBe(
      emailTemplateTypeLabels[dto.templateType] || 'Unknown',
    );
    expect(result.templateType.tagConfig.backgroundColor).toBe('lightWhite');
    expect(result.templateType.tagConfig.textColor).toBe('black');
    expect(result.templateType.tagConfig.hasBorder).toBe(true);

    // status mapping
    expect(result.status.tagConfig.id).toBe(dto.id.toString());
    expect(result.status.tagConfig.label).toBe('Active');
    expect(result.status.tagConfig.backgroundColor).toBe(colors.green.bg);
    expect(result.status.tagConfig.textColor).toBe(colors.green.text);

    // actions mapping
    expect(result.actions).toHaveLength(4);
    expect(result.actions[0]).toEqual({ icon: 'visibility', tooltip: 'View Template' });
    expect(result.actions[1]).toEqual({ icon: 'edit', tooltip: 'Edit Template' });
    expect(result.actions[2]).toEqual({ icon: 'delete', tooltip: 'Delete Template' });
    expect(result.actions[3]).toEqual({ icon: 'block', tooltip: 'Deactivate Template' });
  });

  it('should map EmailTemplatesResponseDto to TableData (inactive template)', () => {
    const dto: EmailTemplatesResponseDto = {
      id: 2,
      title: 'Reminder Template',
      subject: 'Reminder Subject',
      templateType: 1,
      status: false,
      body: null,
    };

    const result: any = emailTemplateToTableData(dto);

    // status inactive
    expect(result.status.tagConfig.label).toBe('Inactive');
    expect(result.status.tagConfig.backgroundColor).toBe(colors.red.bg);
    expect(result.status.tagConfig.textColor).toBe(colors.red.text);

    // action should toggle to "Activate"
    expect(result.actions[3]).toEqual({
      icon: 'check_circle_outline',
      tooltip: 'Activate Template',
    });
  });

  it('should fallback to "Unknown" label if templateType is unmapped', () => {
    const dto: EmailTemplatesResponseDto = {
      id: 3,
      title: 'Unknown Template',
      subject: 'Unknown Subject',
      templateType: 999, // not in emailTemplateTypeLabels
      status: true,
      body: null,
    };

    const result: any = emailTemplateToTableData(dto);

    expect(result.templateType.tagConfig.label).toBe('Unknown');
  });
});
