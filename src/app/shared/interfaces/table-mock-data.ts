// table-mock-data.ts

export const defaultActions = [
  { icon: 'visibility', action: 'view' },
  { icon: 'edit', action: 'edit' },
  { icon: 'delete', action: 'delete', color: 'warn' },
];

export const questionPoolData = [
  {
    question: 'What is the capital of France?',
    correctAnswer: 'Paris',
    type: 'Multiple Choice',
    category: 'Geography',
    difficulty: 'Easy',
  },
  {
    question: 'What is 2 + 2?',
    correctAnswer: '4',
    type: 'Multiple Choice',
    category: 'Mathematics',
    difficulty: 'Easy',
  },
  {
    question: 'What is 2 + 2?',
    correctAnswer: '4',
    type: 'Multiple Choice',
    category: 'Mathematics',
    difficulty: 'Easy',
  },
];

export const transactionData = [
  {
    type: 'Quiz Purchase',
    user: 'John Doe',
    amount: 15.99,
    status: 'Completed',
    date: '2024-12-20',
    method: 'Credit Card',
  },
  {
    type: 'Tournament Entry',
    user: 'Mike Johnson',
    amount: 25.0,
    status: 'Completed',
    date: '2024-12-18',
    method: 'Stripe',
  },
  {
    type: 'Subscription',
    user: 'Sarah Wilson',
    amount: 9.99,
    status: 'Completed',
    date: '2024-12-17',
    method: 'Credit Card',
  },
  {
    type: 'Quiz Purchase',
    user: 'Emma Davis',
    amount: 12.5,
    status: 'Pending',
    date: '2024-12-16',
    method: 'PayPal',
  },
];

export const profileData = [
  {
    profile: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      image: 'https://i.pravatar.cc/150?img=11',
    },
    role: 'Admin',
    status: 'Active',
  },
  {
    profile: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      image: 'https://i.pravatar.cc/150?img=12',
    },
    role: 'User',
    status: 'Inactive',
  },
  {
    profile: {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      image: 'https://i.pravatar.cc/150?img=13',
    },
    role: 'Moderator',
    status: 'Pending',
  },
];

export const categoriesData = [
  {
    category: 'Technology',
    description: 'Programming, Software, Hardware, AI/ML',
    quizCount: '245 quizzes',
    status: 'Active',
    created: '2024-01-15',
  },
  {
    category: 'Science',
    description: 'Physics, Chemistry, Biology, Mathematics',
    quizCount: '189 quizzes',
    status: 'Active',
    created: '2024-01-15',
  },
  {
    category: 'History',
    description: 'World History, Ancient Civilizations, Wars',
    quizCount: '156 quizzes',
    status: 'Active',
    created: '2024-01-15',
  },
  {
    category: 'Literature',
    description: 'Classic Literature, Poetry, Modern Fiction',
    quizCount: '98 quizzes',
    status: 'Inactive',
    created: '2024-01-15',
  },
];

export const emailData = [
  {
    type: 'Password Reset',
    title: 'Password Reset Request',
    subject: 'Reset Your Password - QuizPlatform',
    status: 'Active',
  },
  {
    type: 'Email Verification',
    title: 'Verify Your Email',
    subject: 'Verify Your Email Address - QuizPlatform',
    status: 'Active',
  },
  {
    type: 'Battle Request',
    title: 'Battle Challenge Received',
    subject: "You've Been Challenged to a Battle!",
    status: 'Active',
  },
];

export const tagsOnlyData = [
  { type: 'Alert', status: 'Active' },
  { type: 'Warning', status: 'Inactive' },
];

export const textButtonData = [
  { title: 'Do Task 1', actionsLabel: 'Start' },
  { title: 'Do Task 2', actionsLabel: 'Run' },
];

export const basicUserData = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' },
];

export const largeUserList = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  status: i % 2 === 0 ? 'Active' : 'Inactive',
}));

export const mixedTypeData = [
  { id: 1, name: 'Alice', status: 'Active', score: 88, actionBtn: 'View' },
  { id: 2, name: 'Bob', status: 'Inactive', score: 74, actionBtn: 'Edit' },
];

export const customColumnData = [
  { name: 'Alice', age: 30, status: 'Active' },
  { name: 'Bob', age: 25, status: 'Inactive' },
];
