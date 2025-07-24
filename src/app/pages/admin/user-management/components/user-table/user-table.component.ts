import { Component } from '@angular/core';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import {
  USER_TABLE_COLUMNS_CONFIG,
  USER_TABLE_PAGINATION_CONFIG,
} from '../../configs/user-table.config';
import { TableData } from '../../../../../shared/interfaces/table-component.interface';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss'],
})
export class UserTableComponent {
  columns = USER_TABLE_COLUMNS_CONFIG;
  paginationConfig = USER_TABLE_PAGINATION_CONFIG;
  tableTitle = 'All Users';
  tableDescription = 'Manage and monitor user accounts';

  dataSource: TableData[] = [
    {
      user: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        image: 'https://i.pravatar.cc/100?img=5',
      },
      role: {
        tagConfig: {
          id: 'player',
          label: 'Player',
          type: 'static',
          backgroundColor: 'lightOrange',
          textColor: 'orange',
        },
      },
      status: {
        tagConfig: {
          id: 'active',
          label: 'Active',
          type: 'static',
          backgroundColor: 'lightGreen',
          textColor: 'green',
        },
      },
      joinDate: '2024-12-15T00:00:00.000Z',
      lastActive: '2024-12-23T00:00:00.000Z',
      attemptedQuizzes: {
        tagConfig: {
          id: 'quizzes-1',
          label: '45',
          type: 'static',
          backgroundColor: 'white',
          textColor: 'black',
        },
        extraText: 'quizzes',
      },
      actions: ['visibility', 'edit', 'delete'],
    },
    {
      user: {
        name: 'Bob Smith',
        email: 'bob@example.com',
        image: 'https://i.pravatar.cc/100?img=6',
      },
      role: {
        tagConfig: {
          id: 'player',
          label: 'Player',
          type: 'static',
          backgroundColor: 'lightOrange',
          textColor: 'orange',
        },
      },
      status: {
        tagConfig: {
          id: 'active',
          label: 'Active',
          type: 'static',
          backgroundColor: 'lightGreen',
          textColor: 'green',
        },
      },
      joinDate: '2024-11-20T00:00:00.000Z',
      lastActive: '2024-12-22T00:00:00.000Z',
      attemptedQuizzes: {
        tagConfig: {
          id: 'quizzes-2',
          label: '32',
          type: 'static',
          backgroundColor: 'white',
          textColor: 'black',
        },
        extraText: 'quizzes',
      },
      actions: ['visibility', 'edit', 'delete'],
    },
    {
      user: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        image: 'https://i.pravatar.cc/100?img=7',
      },
      role: {
        tagConfig: {
          id: 'player',
          label: 'Player',
          type: 'static',
          backgroundColor: 'lightOrange',
          textColor: 'orange',
        },
      },
      status: {
        tagConfig: {
          id: 'suspended',
          label: 'Suspended',
          type: 'static',
          backgroundColor: 'lightBrown',
          textColor: 'brown',
        },
      },
      joinDate: '2024-10-05T00:00:00.000Z',
      lastActive: '2024-12-10T00:00:00.000Z',
      attemptedQuizzes: {
        tagConfig: {
          id: 'quizzes-3',
          label: '28',
          type: 'static',
          backgroundColor: 'white',
          textColor: 'black',
        },
        extraText: 'quizzes',
      },
      actions: ['visibility', 'edit', 'delete'],
    },
    {
      user: {
        name: 'David Wilson',
        email: 'david@example.com',
        image: 'https://i.pravatar.cc/100?img=8',
      },
      role: {
        tagConfig: {
          id: 'admin',
          label: 'Admin',
          type: 'static',
          backgroundColor: 'lightPurple',
          textColor: 'purple',
        },
      },
      status: {
        tagConfig: {
          id: 'active',
          label: 'Active',
          type: 'static',
          backgroundColor: 'lightGreen',
          textColor: 'green',
        },
      },
      joinDate: '2024-01-15T00:00:00.000Z',
      lastActive: '2024-12-23T00:00:00.000Z',
      attemptedQuizzes: {
        tagConfig: {
          id: 'quizzes-4',
          label: '56',
          type: 'static',
          backgroundColor: 'white',
          textColor: 'black',
        },
        extraText: 'quizzes',
      },
      actions: ['visibility', 'edit', 'delete'],
    },
  ];

  totalItems = this.dataSource.length;

  onActionClick(event: { action: string; row: TableData }) {}

  onPageChange(event: { pageIndex: number; pageSize: number }) {}

  onSortChange(event: { active: string; direction: string }) {}
}
