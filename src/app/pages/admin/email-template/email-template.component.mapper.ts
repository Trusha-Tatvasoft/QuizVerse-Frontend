import { TableData } from '../../../shared/interfaces/table-component.interface';
import { colors, emailTemplateTypeLabels } from '../../../utils/constants';
import { EmailTemplatesResponseDto } from './configs/email-template.component.config';
export function emailTemplateToTableData(dto: EmailTemplatesResponseDto): TableData {
  return {
    id: dto.id,

    templateType: {
      tagConfig: {
        id: dto.templateType.toString(),
        label: emailTemplateTypeLabels[dto.templateType] || 'Unknown',
        type: 'static',
        backgroundColor: 'lightWhite',
        textColor: 'black',
        hasBorder: true,
      },
    },

    title: dto.title,
    subject: dto.subject,

    status: {
      tagConfig: {
        id: dto.id.toString(),
        label: dto.status ? 'Active' : 'Inactive',
        type: 'static',
        backgroundColor: dto.status ? colors.green.bg : colors.red.bg,
        textColor: dto.status ? colors.green.text : colors.red.text,
      },
    },

    actions: [
      { icon: 'visibility', tooltip: 'View Template' },
      { icon: 'edit', tooltip: 'Edit Template' },
      { icon: 'delete', tooltip: 'Delete Template' },
      {
        icon: dto.status ? 'remove_circle_outline' : 'check_circle_outline',
        tooltip: dto.status ? 'Deactivate Template' : 'Activate Template',
      },
    ],
  };
}
