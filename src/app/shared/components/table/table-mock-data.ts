import { ColumnDef, TableData, ActionIcon } from '../../interfaces/table-component.interface';

// 1. Category
export const categoryColumns: ColumnDef[] = [
  { key: 'category', label: 'Category', type: 'category' },
  { key: 'title', label: 'Title', type: 'text', isSortable: true },
];

export const categoryData: TableData[] = [
  { title: 'Physics Quiz', category: { name: 'Science', icon: 'science' } },
  { title: 'Math Basics', category: { name: 'Mathematics', icon: 'functions' } },
];

// 2. Question Pool
export const questionPoolColumns: ColumnDef[] = [
  { key: 'questionPool', label: 'Questions', type: 'question-pool' },
  { key: 'quiz', label: 'Quiz Name', type: 'text' },
];

export const questionPoolData: TableData[] = [
  {
    quiz: 'General Science',
    questionPool: [
      { question: 'What is H2O?', correctAnswer: 'Water' },
      { question: 'What gas do plants absorb?', correctAnswer: 'CO2' },
    ],
  },
  {
    quiz: 'Algebra Basics',
    questionPool: [{ question: 'Solve x in 2x = 6', correctAnswer: '3' }],
  },
];

// 3. Profile
export const profileColumns: ColumnDef[] = [
  { key: 'user', label: 'User Info', type: 'profile' },
  { key: 'role', label: 'Role', type: 'text' },
];

export const profileData: TableData[] = [
  {
    user: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      image: 'https://i.pravatar.cc/100?img=5',
    },
    role: 'Admin',
  },
  {
    user: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      image: 'https://i.pravatar.cc/100?img=6',
    },
    role: 'Moderator',
  },
  {
    user: {
      name: 'Clara Williams',
      email: 'clara@example.com',
      image: 'https://i.pravatar.cc/100?img=7',
    },
    role: 'Editor',
  },
  {
    user: {
      name: 'David Lee',
      email: 'david@example.com',
      image: 'https://i.pravatar.cc/100?img=8',
    },
    role: 'Contributor',
  },
  {
    user: {
      name: 'Eva Brown',
      email: 'eva@example.com',
      image: 'https://i.pravatar.cc/100?img=9',
    },
    role: 'Admin',
  },
  {
    user: {
      name: 'Frank Green',
      email: 'frank@example.com',
      image: 'https://i.pravatar.cc/100?img=10',
    },
    role: 'Viewer',
  },
];

// 4. Tags
export const tagColumns: ColumnDef[] = [
  { key: 'role', label: 'Role', type: 'tag' },
  { key: 'status', label: 'Status', type: 'tag' },
  { key: 'difficulty', label: 'Difficulty', type: 'tag' },
  { key: 'attempts', label: 'Attempted Quizzes', type: 'tag' },
];

export const tagData: TableData[] = [
  {
    role: {
      tagConfig: {
        id: 'player',
        label: 'Player',
        type: 'static',
        backgroundColor: 'lightOrange',
        textColor: 'orange',
        hasBorder: true,
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
    difficulty: {
      tagConfig: {
        id: 'medium',
        label: 'Medium',
        type: 'static',
        backgroundColor: 'black',
        textColor: 'white',
      },
    },
    attempts: {
      tagConfig: {
        id: 'attempt-1',
        label: '45',
        type: 'static',
        backgroundColor: 'white',
        textColor: 'black',
      },
      extraText: 'quizzes',
    },
  },
  {
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
        id: 'suspended',
        label: 'Suspended',
        type: 'static',
        backgroundColor: 'lightBrown',
        textColor: 'brown',
      },
    },
    difficulty: {
      tagConfig: {
        id: 'easy',
        label: 'Easy',
        type: 'static',
        backgroundColor: 'lightYellow',
        textColor: 'yellow',
      },
    },
    attempts: {
      tagConfig: {
        id: 'attempt-2',
        label: '32',
        type: 'static',
        backgroundColor: 'white',
        textColor: 'black',
      },
      extraText: 'quizzes',
    },
  },
];

// 5. Mixed data
export const actionIcons: ActionIcon[] = [
  {
    action: 'edit',
    icon: 'edit_square',
    color: '#000000',
    tooltip: 'Edit User',
  },
];

export const mixedColumns: ColumnDef[] = [
  { key: 'name', label: 'Name', type: 'text', class: 'text-bold' },
  { key: 'email', label: 'Email', type: 'text', class: 'text-muted' },
  {
    key: 'price',
    label: 'Price',
    type: 'text',
    pipe: 'currency',
    pipeArgs: ['INR', 'symbol', '1.2-2'],
    class: 'text-success',
  },
  {
    key: 'purchasedOn',
    label: 'Purchased On',
    type: 'text',
    pipe: 'date',
    pipeArgs: ['yyyy-MM-dd'],
  },
];

export const mixedData: TableData[] = [
  {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    price: { amount: 499.99, currencyCode: 'INR' },
    purchasedOn: '2024-12-01T00:00:00.000Z',
  },
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    price: { amount: 299.5, currencyCode: 'INR' },
    purchasedOn: '2024-11-20T00:00:00.000Z',
  },
];
