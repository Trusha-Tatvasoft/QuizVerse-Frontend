export interface UserListData {
  id: number;
  fullName: string;
  email: string;
  userName: string;
  roleId: number; // Role ID reference
  status: number; // Enum: Active/Suspended/etc.
  createdDate: string; // ISO date
  lastLogin: string; // ISO date
  bio?: string;
  profilePic?: string;
  attemptedQuizzes: number;
}
