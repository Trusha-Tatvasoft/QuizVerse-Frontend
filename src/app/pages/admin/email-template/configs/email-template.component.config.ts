import { ButtonConfig } from '../../../../shared/interfaces/button-config.interface';
import { ColumnDef } from '../../../../shared/interfaces/table-component.interface';

export const emailHeaderConfig = {
  icon: 'mail',
  title: 'Email Template Management',
  subtitle: 'Configure email templates for various platform notifications',
  theme: 'email' as const,
};

export const createTemplateButtonConfig: ButtonConfig = {
  label: 'Ceate Temaplate',
  variant: 'secondary',
  fontWeight: 500,
  matIcon: 'add',
  iconFontSet: 'material-icons',
};

export const emailTableColumnsConfig: ColumnDef[] = [
  {
    key: 'templateType',
    label: 'Type',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'subject',
    label: 'Subject',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'button',
    isSortable: false,
  },
];
export interface EmailTemplatesResponseDto {
  id: number;
  templateType: number;
  title: string;
  subject: string;
  body: string | null;
  status: boolean; // true = Active, false = Inactive
}
