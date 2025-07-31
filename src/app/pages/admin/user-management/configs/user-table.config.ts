import { ColumnDef, TableData } from '../../../../shared/interfaces/table-component.interface';
import { TablePaginationConfig } from '../../../../utils/constants';

export const USER_TABLE_COLUMNS_CONFIG: ColumnDef[] = [
  {
    key: 'user',
    label: 'User',
    type: 'profile',
    isSortable: true,
  },
  {
    key: 'role',
    label: 'Role',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'tag',
    isSortable: true,
  },
  {
    key: 'joinDate',
    label: 'Join Date',
    type: 'text',
    pipe: 'date',
    pipeArgs: ['yyyy-MM-dd'],
    isSortable: true,
  },
  {
    key: 'lastActive',
    label: 'Last Active',
    type: 'text',
    pipe: 'date',
    pipeArgs: ['yyyy-MM-dd'],
    isSortable: true,
  },
  {
    key: 'attemptedQuizzes',
    label: 'Attempted Quizzes',
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

export const USER_TABLE_PAGINATION_CONFIG = {
  pageSize: TablePaginationConfig.PageSize,
  pageSizeOptions: TablePaginationConfig.PageSizeOptions,
  applyPaginator: true,
};

export const USER_TABLE_DATA: TableData[] = [
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
    actions: ['edit', 'delete', 'block', 'remove_circle_outline'],
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
        label: 'Inactive',
        type: 'static',
        backgroundColor: 'lightYellow',
        textColor: 'yellow',
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
    actions: ['edit', 'delete', 'block', 'check_circle_outline'],
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
    actions: ['edit', 'delete', 'block', 'remove_circle_outline'],
  },
  {
    user: {
      name: 'David Wilson',
      email: 'david@example.com',
      // image: 'https://i.pravatar.cc/100?img=8',
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
    actions: ['edit', 'delete', 'block', 'remove_circle_outline'],
  },
];
