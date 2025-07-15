import { Meta, StoryObj } from '@storybook/angular';
import { TableComponent } from './table.component';
import { moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import {
  categoryColumns,
  categoryData,
  questionPoolColumns,
  questionPoolData,
  profileColumns,
  profileData,
  tagColumns,
  tagData,
  actionIcons,
  mixedColumns,
  mixedData,
} from './table-mock-data';

const meta: Meta<TableComponent> = {
  title: 'Components/Table',
  decorators: [moduleMetadata({ imports: [MatButtonModule, MatIconModule] })],
  component: TableComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<TableComponent>;

export const CategoryIconOnly: Story = {
  name: 'Category Icon',
  args: {
    tableTitle: 'Category Table',
    tableDescription: 'Shows quizzes with associated category and icons.',
    columns: categoryColumns,
    dataSource: categoryData,
    totalItems: 2,
    pageSize: 5,
    pageSizeOptions: [5, 10],
    applyPaginator: true,
  },
};

export const QuestionPoolOnly: Story = {
  name: 'Question Pool',
  args: {
    tableTitle: 'Question Pool Table',
    tableDescription: 'Displays quizzes with a list of questions and answers.',
    columns: questionPoolColumns,
    dataSource: questionPoolData,
    totalItems: 2,
    pageSize: 5,
    pageSizeOptions: [5, 10],
    applyPaginator: true,
  },
};

export const ProfileOnly: Story = {
  name: 'Profile',
  args: {
    tableTitle: 'User Profile Table',
    tableDescription: 'Displays user information with avatars.',
    columns: profileColumns,
    dataSource: profileData,
    totalItems: profileData.length,
    pageSize: 5,
    pageSizeOptions: [5, 10],
    applyPaginator: true,
  },
};

export const StaticTagsOnly: Story = {
  name: 'Static Tags',
  args: {
    tableTitle: 'User & Quiz Status',
    tableDescription:
      'Shows static tags for user roles, statuses, difficulty levels, and attempts.',
    columns: tagColumns,
    dataSource: tagData,
    totalItems: tagData.length,
    pageSize: 5,
    pageSizeOptions: [5, 10],
    applyPaginator: false,
  },
};

export const MixedDataTable: Story = {
  name: 'Mix Column',
  args: {
    tableTitle: 'User Purchase Summary',
    tableDescription: 'Shows user info, purchase price (currency), and date with edit action.',
    columns: mixedColumns,
    dataSource: mixedData,
    actionIcons: actionIcons,
    totalItems: mixedData.length,
    pageSize: 5,
    pageSizeOptions: [5, 10],
    applyPaginator: false,
  },
};
