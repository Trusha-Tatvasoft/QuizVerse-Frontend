import { TagInputConfig } from '../../../shared/interfaces/tag-component.interface';

export interface Notifications {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  tagConfig: TagInputConfig;
}
