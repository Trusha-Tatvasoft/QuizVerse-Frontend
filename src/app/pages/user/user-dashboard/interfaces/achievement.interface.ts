export interface Achievement {
  id: number;
  name: string;
  description: string;
  earned: boolean;
}

export const dummyAchievement: Achievement[] = [
  {
    id: 1,
    name: 'First Victory',
    description: 'Win your first quiz battle',
    earned: true,
  },
  {
    id: 2,
    name: 'Knowledge Seeker',
    description: 'Complete 50 quizzes',
    earned: true,
  },
  {
    id: 3,
    name: 'Tournament Champion',
    description: 'Win a tournament',
    earned: false,
  },
  {
    id: 4,
    name: 'Quiz Creator',
    description: 'Create your first quiz',
    earned: false,
  },
];
