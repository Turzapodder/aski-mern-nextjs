export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  status: string;
  data: {
    notifications: Notification[];
    unreadCount: number;
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
}
