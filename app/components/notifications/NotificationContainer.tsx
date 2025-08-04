// components/notifications/NotificationContainer.tsx
import { useNotifications } from '~/lib/notifications';
import NotificationItem from './NotificationItem';

const NotificationContainer = () => {
  // Access notifications and removeNotification from the context
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;