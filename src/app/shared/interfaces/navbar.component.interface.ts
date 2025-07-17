import { TagInputConfig } from './tag-component.interface';

export interface Notifications {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  tagConfig: TagInputConfig;
}
