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
    questionPoolColumns,
    questionPoolData,
    transactionColumns,
    transactionData,
    profileColumns,
    profileData,
    categoryColumns,
    categoryData,
    emailTemplateColumns,
    emailTemplateData,
    tagOnlyColumns,
    tagOnlyData,
    textButtonColumns,
    textButtonData,
    userColumns,
    userData,
    mixedColumns,
    mixedData,
    defaultActions
} from '../../interfaces/table-mock-data';

export default {
    title: 'Components/Data Table',
    component: TableComponent,
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
                TableComponent
            ]
        })
    ]
} as Meta<TableComponent>;

type Story = StoryObj<TableComponent>;

export const QuestionPoolCustom: Story = {
    name: 'Question Pool - Custom Column',
    render: (args) => ({
        component: TableComponent,
        props: {
            ...args,
            totalItems: questionPoolData.length
        },
        template: `
      <ng-template #questionWithAnswer let-row>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="display: flex; flex-direction: column;">
            <div style="font-weight: 500;">{{ row.question }}</div>
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
        [pageSizeOptions]="pageSizeOptions"
      ></app-data-table>
    `
    }),
    args: {
        tableDescription: 'Manage and organize questions for quizzes and battles',
        columns: questionPoolColumns,
        dataSource: questionPoolData,
        actionIcons: defaultActions,
        pageSize: 5,
        pageSizeOptions: [5, 10, 20]
    }
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
        [columnTemplates]="{ 'amount': currencyCell, 'status': statusChip }"
        [tableTitle]="tableTitle"
        [tableDescription]="tableDescription"
        [totalItems]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="pageSizeOptions"
      ></app-data-table>
    `
    }),
    args: {
        tableTitle: 'Recent Transactions',
        tableDescription: 'All payment transactions and platform activity',
        columns: transactionColumns,
        dataSource: transactionData,
        actionIcons: [{ icon: 'visibility', action: 'view', tooltip: 'View' }],
        totalItems: transactionData.length,
        pageSize: 5,
        pageSizeOptions: [5, 10, 20]
    }
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
        [pageSizeOptions]="[5, 10, 20]"
      ></app-data-table>
    `
    }),
    args: {
        tableTitle: 'User Profiles',
        tableDescription: 'List of users with profile and role information',
        columns: profileColumns,
        dataSource: profileData,
        totalItems: profileData.length,
        pageSize: 5,
        actionIcons: defaultActions
    }
};

export const WithTitleAndDescription: Story = {
    name: 'With Title & Description',
    args: {
        tableTitle: 'All Categories',
        tableDescription: 'Manage quiz categories and their organization',
        columns: categoryColumns,
        dataSource: categoryData,
        totalItems: categoryData.length,
        pageSize: 10,
        actionIcons: defaultActions
    }
};

export const EmptyTable: Story = {
    name: 'Empty Table',
    args: {
        tableTitle: 'No Records Found',
        tableDescription: 'Currently, there are no categories to display.',
        columns: categoryColumns,
        dataSource: [],
        totalItems: 0,
        pageSize: 10,
        actionIcons: [],
        noDataMessage: 'No categories found. Please add one.'
    }
};

export const TagsOnlyTable: Story = {
    name: 'Tags Only',
    args: {
        columns: tagOnlyColumns,
        dataSource: tagOnlyData,
        totalItems: tagOnlyData.length,
        pageSize: 10,
        actionIcons: defaultActions
    }
};

export const TextAndButtons: Story = {
    name: 'Text & Buttons',
    args: {
        columns: textButtonColumns,
        dataSource: textButtonData,
        totalItems: textButtonData.length,
        pageSize: 10,
        actionIcons: []
    }
};

export const NoActions: Story = {
    name: 'Table without Action Icons',
    args: {
        columns: userColumns,
        dataSource: userData,
        totalItems: userData.length,
        pageSize: 10,
        actionIcons: []
    }
};

export const LargeDataset: Story = {
    name: 'Large Dataset with Pagination',
    args: {
        tableTitle: 'Users',
        columns: userColumns,
        dataSource: userData,
        totalItems: userData.length,
        pageSize: 10,
        actionIcons: defaultActions
    }
};

export const CustomColumnTypes: Story = {
    name: 'Custom Column Types',
    args: {
        columns: emailTemplateColumns,
        dataSource: emailTemplateData,
        totalItems: emailTemplateData.length,
        pageSize: 10,
        actionIcons: defaultActions
    }
};

export const LoadingState: Story = {
    name: 'Loading State',
    args: {
        tableTitle: 'Loading Users',
        columns: userColumns,
        dataSource: [],
        totalItems: 0,
        pageSize: 10,
        actionIcons: [],
        noDataMessage: 'Loading data, please wait...'
    }
};

export const ErrorState: Story = {
    name: 'Error State',
    args: {
        tableTitle: 'Error Fetching Data',
        columns: userColumns,
        dataSource: [],
        totalItems: 0,
        pageSize: 10,
        actionIcons: [],
        noDataMessage: 'An error occurred while loading data.'
    }
};

export const MixedTypeTable: Story = {
    name: 'Mixed Column Types',
    args: {
        tableTitle: 'Mixed Column Table',
        columns: mixedColumns,
        dataSource: mixedData,
        totalItems: mixedData.length,
        pageSize: 10,
        actionIcons: defaultActions
    }
};
