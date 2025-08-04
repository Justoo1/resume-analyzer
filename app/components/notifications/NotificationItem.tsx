// components/notifications/NotificationItem.tsx
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import type { Notification } from '~/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem = ({ notification, onRemove }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getMessageColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div
      className={`
        max-w-md w-full p-4 rounded-lg border shadow-lg 
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
        ${getBackgroundColor()}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${getTitleColor()}`}>
            {notification.title}
          </h4>
          <p className={`mt-1 text-sm ${getMessageColor()}`}>
            {notification.message}
          </p>
          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    text-xs font-medium px-3 py-1 rounded-md transition-colors duration-200
                    ${action.variant === 'primary' 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : action.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {notification.dismissible && (
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => onRemove(notification.id)}
              className={`
                inline-flex rounded-md p-1.5 transition-colors duration-200
                ${notification.type === 'success' 
                  ? 'text-green-400 hover:bg-green-100 focus:bg-green-100' 
                  : notification.type === 'error'
                  ? 'text-red-400 hover:bg-red-100 focus:bg-red-100'
                  : notification.type === 'warning'
                  ? 'text-yellow-400 hover:bg-yellow-100 focus:bg-yellow-100'
                  : 'text-blue-400 hover:bg-blue-100 focus:bg-blue-100'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500
              `}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;