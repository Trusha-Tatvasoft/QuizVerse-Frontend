export interface NotificationCenterRequest {
  searchText?: string;
  adminCategory: number;
  userCategory: number;
  type: number;
  time: number;
  notificationStatusSelected: number;
}
