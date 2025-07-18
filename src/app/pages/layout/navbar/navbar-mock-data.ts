import { yellow } from '../../../utils/constants';
import { Notifications } from '../interfaces/navbar.component.interface';

export const mockDataNotifications: Notifications[] = [
  {
    id: '1',
    title: 'Test Title',
    message: 'Test message content',
    timeAgo: '1 min ago',
    read: false,
    tagConfig: yellow,
  },
];
