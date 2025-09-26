import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';
export interface Notifications {
  id: string;
  title: string;
  message: string;
  timeAgo: Date;
  read: boolean;
  tagConfig: TagInputConfig;
  category: string;
  categoryValue: number;
}

export interface NavbarData {
  progressPercentage: number | null;
  currentUserXp: number | null;
  profilePic: string | null;
  notificationCount: number;
}
