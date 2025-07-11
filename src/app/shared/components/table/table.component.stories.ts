import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { TableComponent } from './table.component';
import { TablePaginationConfig } from '../../../utils/constants';
import { ColumnDef, TableData, ActionIcon } from '../../interfaces/table.interface';

const meta: Meta<TableComponent> = {
  title: 'Components/Table',
  component: TableComponent,
  decorators: [
    moduleMetadata({
      imports: [],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component: `
The \`TableComponent\` is a reusable Angular Material table that supports:
- Custom columns (text, tag, button, profile, currency, category)
- Sortable headers
- Action buttons
- Pagination
- Custom templates per column
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TableComponent>;

const mockColumns: ColumnDef[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    isSortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'tag',
  },
];

const mockData: TableData[] = [
  { name: 'John Doe', status: 'Active' },
  { name: 'Jane Smith', status: 'Inactive' },
  { name: 'Mark Wilson', status: 'Pending' },
];

const mockActions: ActionIcon[] = [
  {
    icon: 'edit',
    action: 'edit',
    color: '#1976d2',
    tooltip: 'Edit User',
  },
];

export const BasicTable: Story = {
  name: 'Basic Table with Text and Tags',
  args: {
    columns: mockColumns,
    dataSource: mockData,
    totalItems: mockData.length,
    pageSize: TablePaginationConfig.PageSize,
    pageSizeOptions: TablePaginationConfig.PageSizeOptions,
    actionIcons: mockActions,
    tableTitle: 'User List',
    tableDescription: 'A basic table showing users with status tags.',
    noDataMessage: 'No users found.',
    applyPaginator: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This is a basic table setup using the `TableComponent` with tag and text columns, sortable headers, and a simple action icon.',
      },
    },
  },
};
