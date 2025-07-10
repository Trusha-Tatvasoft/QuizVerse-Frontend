import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { TableComponent } from './table.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import {
  defaultActions,
  questionPoolData,
  transactionData,
  profileData,
  categoriesData,
  emailData,
  tagsOnlyData,
  textButtonData,
  basicUserData,
  largeUserList,
  mixedTypeData,
} from '../../interfaces/table-mock-data';

export default {
  title: 'Components/Data Table',
  component: TableComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A flexible and reusable table component with support for custom columns, sorting, pagination, and action icons.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatChipsModule,
        TableComponent,
      ],
    }),
  ],
} satisfies Meta<TableComponent>;

type Story = StoryObj<TableComponent>;

export const QuestionPoolCustom: Story = {
  name: 'Question Pool - Custom Column',
  render: (args) => ({
    component: TableComponent,
    props: {
      ...args,
      totalItems: questionPoolData.length,
    },
    template: `
    <ng-template #questionWithAnswer let-row>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="display: flex; flex-direction: column;">
          <div style="font-weight: 600;">{{ row.question }}</div>
          <div style="font-size: 12px; color: #666;">Correct: {{ row.correctAnswer }}</div>
        </div>
      </div>
    </ng-template>

    <app-data-table
      [columns]="columns"
      [dataSource]="dataSource"
      [actionIcons]="actionIcons"
      [columnTemplates]="{ 'questionBlock': questionWithAnswer }"
      [tableTitle]="'Question Pool (' + dataSource.length + ')'"
      [tableDescription]="tableDescription"
      [totalItems]="totalItems"
      [pageSize]="pageSize"
      [pageSizeOptions]="pageSizeOptions">
    </app-data-table>
    `,
  }),
  args: {
    tableDescription: 'Manage and organize questions for quizzes and battles',
    columns: [
      { key: 'questionBlock', label: 'Question', type: 'custom' },
      { key: 'type', label: 'Type', type: 'tag' },
      { key: 'category', label: 'Category', type: 'text', isSortable: true },
      { key: 'difficulty', label: 'Difficulty', type: 'tag' },
    ],
    dataSource: questionPoolData,
    actionIcons: defaultActions,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
  },
};

export const TransactionList: Story = {
  name: 'Recent Transactions Table',
  render: (args) => ({
    component: TableComponent,
    props: args,
    template: `
      <ng-template #currencyCell let-row>
        <span class="text-success">{{ row.amount | currency:'USD':'symbol':'1.2-2' }}</span>
      </ng-template>

      <ng-template #statusChip let-row>
        <mat-chip [color]="row.status === 'Completed' ? 'primary' : 'warn'" selected>
          {{ row.status }}
        </mat-chip>
      </ng-template>

      <app-data-table
        [columns]="columns"
        [dataSource]="dataSource"
        [actionIcons]="actionIcons"
        [columnTemplates]="{
          'amount': currencyCell,
          'status': statusChip
        }"
        [tableTitle]="tableTitle"
        [tableDescription]="tableDescription"
        [totalItems]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions">
      </app-data-table>`,
  }),
  args: {
    tableTitle: 'Recent Transactions',
    tableDescription: 'All payment transactions and platform activity',
    columns: [
      { key: 'type', label: 'Type', type: 'text', isSortable: true },
      { key: 'user', label: 'User', type: 'text', isSortable: true },
      { key: 'amount', label: 'Amount', type: 'custom', isSortable: true },
      { key: 'status', label: 'Status', type: 'custom', isSortable: true },
      { key: 'date', label: 'Date', type: 'text' },
      { key: 'method', label: 'Method', type: 'text' },
    ],
    dataSource: transactionData,
    actionIcons: [{ icon: 'visibility', action: 'view', tooltip: 'View' }],
    totalItems: transactionData.length,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
  },
};

export const ProfileTable: Story = {
  name: 'User Profile Table',
  render: (args) => ({
    component: TableComponent,
    props: args,
    template: `
      <ng-template #profileCell let-row>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img [src]="row.profile.image" width="32" height="32" style="border-radius: 50%;" alt="Avatar" />
          <div>
            <div style="font-weight: 500;">{{ row.profile.name }}</div>
            <div style="font-size: 12px; color: #666;">{{ row.profile.email }}</div>
          </div>
        </div>
      </ng-template>

      <app-data-table
        [columns]="columns"
        [dataSource]="dataSource"
        [columnTemplates]="{ 'profile': profileCell }"
        [actionIcons]="actionIcons"
        [tableTitle]="tableTitle"
        [tableDescription]="tableDescription"
        [totalItems]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 20]">
      </app-data-table>
    `,
  }),
  args: {
    tableTitle: 'User Profiles',
    tableDescription: 'List of users with profile and role information',
    columns: [
      { key: 'profile', label: 'User', type: 'custom' },
      { key: 'role', label: 'Role', type: 'text', isSortable: true },
      { key: 'status', label: 'Status', type: 'tag' },
    ],
    dataSource: profileData,
    totalItems: profileData.length,
    pageSize: 5,
    actionIcons: [
      { icon: 'person', action: 'profile', tooltip: 'View Profile' },
      { icon: 'edit', action: 'edit', tooltip: 'Edit' },
      { icon: 'delete', action: 'delete', tooltip: 'Delete', color: 'warn' },
    ],
  },
};

export const WithTitleAndDescription: Story = {
  name: 'With Title & Description',
  args: {
    tableTitle: 'All Categories',
    tableDescription: 'Manage quiz categories and their organization',
    columns: [
      { key: 'category', label: 'Category', type: 'text', isSortable: true },
      { key: 'description', label: 'Description', type: 'text', isSortable: true },
      { key: 'quizCount', label: 'Quiz Count', type: 'button', isSortable: true },
      { key: 'status', label: 'Status', type: 'tag' },
      { key: 'created', label: 'Created', type: 'text' },
    ],
    dataSource: categoriesData,
    totalItems: categoriesData.length,
    pageSize: 10,
    actionIcons: defaultActions,
  },
};

export const WithoutTitleAndDescription: Story = {
  name: 'Without Title & Description',
  args: {
    columns: [
      { key: 'type', label: 'Type', type: 'tag', isSortable: true },
      { key: 'title', label: 'Title', type: 'text', isSortable: true },
      { key: 'subject', label: 'Subject', type: 'text' },
      { key: 'status', label: 'Status', type: 'tag' },
    ],
    dataSource: emailData,
    totalItems: emailData.length,
    pageSize: 10,
    actionIcons: [
      { icon: 'edit', action: 'edit' },
      { icon: 'delete', action: 'delete', color: 'warn' },
    ],
  },
};

export const EmptyTable: Story = {
  name: 'Empty Table',
  args: {
    tableTitle: 'No Records Found',
    tableDescription: 'Currently, there are no categories to display.',
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
    ],
    dataSource: [],
    totalItems: 0,
    pageSize: 10,
    actionIcons: [],
    noDataMessage: 'No categories found. Please add one.',
  },
};

export const TagsOnlyTable: Story = {
  name: 'Tags Only',
  args: {
    columns: [
      { key: 'type', label: 'Type', type: 'tag' },
      { key: 'status', label: 'Status', type: 'tag' },
    ],
    dataSource: tagsOnlyData,
    totalItems: tagsOnlyData.length,
    pageSize: 10,
    actionIcons: defaultActions,
  },
};

export const TextAndButtons: Story = {
  name: 'Text & Buttons',
  args: {
    columns: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'actionsLabel', label: 'Perform Action', type: 'button' },
    ],
    dataSource: textButtonData,
    totalItems: textButtonData.length,
    pageSize: 10,
    actionIcons: [],
  },
};

export const NoActions: Story = {
  name: 'Table without Action Icons',
  args: {
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
    ],
    dataSource: basicUserData,
    totalItems: basicUserData.length,
    pageSize: 10,
    actionIcons: [],
  },
};

export const LargeDataset: Story = {
  name: 'Large Dataset with Pagination',
  args: {
    tableTitle: 'Users',
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'status', label: 'Status', type: 'tag' },
    ],
    dataSource: largeUserList,
    totalItems: largeUserList.length,
    pageSize: 10,
    actionIcons: defaultActions,
  },
};

export const LoadingState: Story = {
  name: 'Loading State',
  args: {
    tableTitle: 'Loading Users',
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
    ],
    dataSource: [],
    totalItems: 0,
    pageSize: 10,
    actionIcons: [],
    noDataMessage: 'Loading data, please wait...',
  },
};

export const ErrorState: Story = {
  name: 'Error State',
  args: {
    tableTitle: 'Error Fetching Data',
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
    ],
    dataSource: [],
    totalItems: 0,
    pageSize: 10,
    actionIcons: [],
    noDataMessage: 'An error occurred while loading data.',
  },
};

export const MixedTypeTable: Story = {
  name: 'Mixed Column Types',
  args: {
    tableTitle: 'Mixed Column Table',
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'status', label: 'Status', type: 'tag' },
      { key: 'score', label: 'Score', type: 'text' },
      { key: 'actionBtn', label: 'Action', type: 'button' },
    ],
    dataSource: mixedTypeData,
    totalItems: mixedTypeData.length,
    pageSize: 10,
    actionIcons: defaultActions,
  },
};
