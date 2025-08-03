// types/notification.d.ts
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 for persistent
  actions?: NotificationAction[];
  dismissible?: boolean;
  icon?: string;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ApiError {
  success: boolean;
  error: {
    $: string;
    code: string;
    delegate?: string;
    message: string;
    status: number;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}