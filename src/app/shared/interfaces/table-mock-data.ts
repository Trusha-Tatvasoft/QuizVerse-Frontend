import { ActionIcon, ColumnDef, TableData } from '../interfaces/table.interface';

export const defaultActions: ActionIcon[] = [
    { icon: 'visibility', action: 'view' },
    { icon: 'edit', action: 'edit' },
    { icon: 'delete', action: 'delete', color: 'warn' }
];

export const questionPoolColumns: ColumnDef[] = [
    { key: 'questionBlock', label: 'Question', type: 'custom' },
    { key: 'type', label: 'Type', type: 'tag' },
    { key: 'category', label: 'Category', type: 'text', sortable: true },
    { key: 'difficulty', label: 'Difficulty', type: 'tag' }
];

export const questionPoolData: TableData[] = [
    {
        question: 'What is the capital of France?',
        correctAnswer: 'Paris',
        type: 'Multiple Choice',
        category: 'Geography',
        difficulty: 'Easy'
    },
    {
        question: 'What is 2 + 2?',
        correctAnswer: '4',
        type: 'Multiple Choice',
        category: 'Mathematics',
        difficulty: 'Easy'
    },
    {
        question: 'What is 2 + 2?',
        correctAnswer: '4',
        type: 'Multiple Choice',
        category: 'Mathematics',
        difficulty: 'Easy'
    }
];

export const transactionColumns: ColumnDef[] = [
    { key: 'type', label: 'Type', type: 'text', sortable: true },
    { key: 'user', label: 'User', type: 'text', sortable: true },
    { key: 'amount', label: 'Amount', type: 'custom', sortable: true },
    { key: 'status', label: 'Status', type: 'custom', sortable: true },
    { key: 'date', label: 'Date', type: 'text' },
    { key: 'method', label: 'Method', type: 'text' }
];

export const transactionData: TableData[] = [
    {
        type: 'Quiz Purchase',
        user: 'John Doe',
        amount: 15.99,
        status: 'Completed',
        date: '2024-12-20',
        method: 'Credit Card'
    },
    {
        type: 'Tournament Entry',
        user: 'Mike Johnson',
        amount: 25.0,
        status: 'Completed',
        date: '2024-12-18',
        method: 'Stripe'
    },
    {
        type: 'Subscription',
        user: 'Sarah Wilson',
        amount: 9.99,
        status: 'Completed',
        date: '2024-12-17',
        method: 'Credit Card'
    },
    {
        type: 'Quiz Purchase',
        user: 'Emma Davis',
        amount: 12.5,
        status: 'Pending',
        date: '2024-12-16',
        method: 'PayPal'
    }
];

export const profileColumns: ColumnDef[] = [
    { key: 'profile', label: 'User', type: 'custom' },
    { key: 'role', label: 'Role', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'tag' }
];

export const profileData: TableData[] = [
    {
        profile: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            image: 'https://i.pravatar.cc/150?img=11'
        },
        role: 'Admin',
        status: 'Active'
    },
    {
        profile: {
            name: 'Bob Smith',
            email: 'bob@example.com',
            image: 'https://i.pravatar.cc/150?img=12'
        },
        role: 'User',
        status: 'Inactive'
    },
    {
        profile: {
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            image: 'https://i.pravatar.cc/150?img=13'
        },
        role: 'Moderator',
        status: 'Pending'
    }
];

export const categoryColumns: ColumnDef[] = [
    { key: 'category', label: 'Category', type: 'text', sortable: true },
    { key: 'description', label: 'Description', type: 'text', sortable: true },
    { key: 'quizCount', label: 'Quiz Count', type: 'button', sortable: true },
    { key: 'status', label: 'Status', type: 'tag' },
    { key: 'created', label: 'Created', type: 'text' }
];

export const categoryData: TableData[] = [
    {
        category: 'Technology',
        description: 'Programming, Software, Hardware, AI/ML',
        quizCount: '245 quizzes',
        status: 'Active',
        created: '2024-01-15'
    },
    {
        category: 'Science',
        description: 'Physics, Chemistry, Biology, Mathematics',
        quizCount: '189 quizzes',
        status: 'Active',
        created: '2024-01-15'
    },
    {
        category: 'History',
        description: 'World History, Ancient Civilizations, Wars',
        quizCount: '156 quizzes',
        status: 'Active',
        created: '2024-01-15'
    },
    {
        category: 'Literature',
        description: 'Classic Literature, Poetry, Modern Fiction',
        quizCount: '98 quizzes',
        status: 'Inactive',
        created: '2024-01-15'
    }
];

export const emailTemplateColumns: ColumnDef[] = [
    { key: 'type', label: 'Type', type: 'tag', sortable: true },
    { key: 'title', label: 'Title', type: 'text', sortable: true },
    { key: 'subject', label: 'Subject', type: 'text' },
    { key: 'status', label: 'Status', type: 'tag' }
];

export const emailTemplateData: TableData[] = [
    {
        type: 'Password Reset',
        title: 'Password Reset Request',
        subject: 'Reset Your Password - QuizPlatform',
        status: 'Active'
    },
    {
        type: 'Email Verification',
        title: 'Verify Your Email',
        subject: 'Verify Your Email Address - QuizPlatform',
        status: 'Active'
    },
    {
        type: 'Battle Request',
        title: 'Battle Challenge Received',
        subject: "You've Been Challenged to a Battle!",
        status: 'Active'
    }
];

export const tagOnlyColumns: ColumnDef[] = [
    { key: 'type', label: 'Type', type: 'tag' },
    { key: 'status', label: 'Status', type: 'tag' }
];

export const tagOnlyData: TableData[] = [
    { type: 'Alert', status: 'Active' },
    { type: 'Warning', status: 'Inactive' }
];

export const textButtonColumns: ColumnDef[] = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'actionsLabel', label: 'Perform Action', type: 'button' }
];

export const textButtonData: TableData[] = [
    { title: 'Do Task 1', actionsLabel: 'Start' },
    { title: 'Do Task 2', actionsLabel: 'Run' }
];

export const userColumns: ColumnDef[] = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' }
];

export const userData: TableData[] = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' }
];

export const mixedColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'status', label: 'Status', type: 'tag' },
    { key: 'score', label: 'Score', type: 'text' },
    { key: 'actionBtn', label: 'Action', type: 'button' }
];

export const mixedData: TableData[] = [
    { id: 1, name: 'Alice', status: 'Active', score: 88, actionBtn: 'View' },
    { id: 2, name: 'Bob', status: 'Inactive', score: 74, actionBtn: 'Edit' }
];

export const largeUserColumns: ColumnDef[] = [
    { key: 'id', label: 'ID', type: 'text' },
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'status', label: 'Status', type: 'tag' }
];

export const largeUserData: TableData[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    status: i % 2 === 0 ? 'Active' : 'Inactive'
}));
