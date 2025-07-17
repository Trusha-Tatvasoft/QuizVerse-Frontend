import { Meta, StoryObj } from '@storybook/angular';
import { TableComponent } from './table.component';
import { moduleMetadata } from '@storybook/angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TablePaginationConfig } from '../../../utils/constants';

import {
  categoryColumns,
  categoryData,
  questionPoolColumns,
  questionPoolData,
  profileColumns,
  profileData,
  tagColumns,
  tagData,
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

// Category Only - uses type: 'category'
export const CategoryIconOnly: Story = {
  name: 'Category Icon',
  args: {
    tableTitle: 'Category Table',
    tableDescription: 'Shows quizzes with associated category and icons.',
    columns: categoryColumns,
    dataSource: categoryData,
    totalItems: categoryData.length,
    pageSize: TablePaginationConfig.PageSize,
    pageSizeOptions: TablePaginationConfig.PageSizeOptions,
    applyPaginator: true,
  },
};

// Question Pool Only - uses type: 'question-pool'
export const QuestionPoolOnly: Story = {
  name: 'Question Pool',
  args: {
    tableTitle: 'Question Pool Table',
    tableDescription: 'Displays quizzes with a list of questions and answers.',
    columns: questionPoolColumns,
    dataSource: questionPoolData,
    totalItems: questionPoolData.length,
    pageSize: TablePaginationConfig.PageSize,
    pageSizeOptions: TablePaginationConfig.PageSizeOptions,
    applyPaginator: true,
  },
};

// Profile Only - uses type: 'profile'
export const ProfileOnly: Story = {
  name: 'Profile',
  args: {
    tableTitle: 'User Profile Table',
    tableDescription: 'Displays user information with avatars.',
    columns: profileColumns,
    dataSource: profileData,
    totalItems: profileData.length,
    pageSize: TablePaginationConfig.PageSize,
    pageSizeOptions: TablePaginationConfig.PageSizeOptions,
    applyPaginator: true,
  },
};

// Static Tags Only - uses type: 'tag'
export const StaticTagsOnly: Story = {
  name: 'Static Tags',
  args: {
    tableTitle: 'User & Quiz Status',
    tableDescription:
      'Shows static tags for user roles, statuses, difficulty levels, and attempts.',
    columns: tagColumns,
    dataSource: tagData,
    totalItems: tagData.length,
    pageSize: TablePaginationConfig.PageSize,
    pageSizeOptions: TablePaginationConfig.PageSizeOptions,
    applyPaginator: false,
  },
};

// Mixed Data Table - uses multiple types: 'profile', 'text', 'currency', 'date', 'button', also classes like text-bold etc
export const MixedDataTable: Story = {
  name: 'Mix Column',
  args: {
    tableTitle: 'User Purchase Summary',
    tableDescription: 'Shows user info, purchase price (currency), and date with edit action.',
    columns: mixedColumns,
    dataSource: mixedData,
    totalItems: mixedData.length,
    pageSize: TablePaginationConfig.PageSize,
    pageSizeOptions: TablePaginationConfig.PageSizeOptions,
    applyPaginator: false,
  },
};
