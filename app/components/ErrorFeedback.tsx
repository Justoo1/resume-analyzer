import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Lock, Wifi, Server, RefreshCw, X, ExternalLink, Info } from 'lucide-react';
import { ErrorInfo } from '~/lib/error-handler';

interface ErrorFeedbackProps {
  error: ErrorInfo;
  onClose: () => void;
  onRetry?: () => void;
  showRetryTimer?: boolean;
}

const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({ 
  error, 
  onClose, 
  onRetry,
  showRetryTimer = false 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const getIcon = () => {
    switch (error.type) {
      case 'usage_limit':
        return <Clock className="w-6 h-6" />;
      case 'permission':
        return <Lock className="w-6 h-6" />;
      case 'network':
        return <Wifi className="w-6 h-6" />;
      case 'server':
        return <Server className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getColorClasses = () => {
    switch (error.color) {
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          title: 'text-orange-800',
          text: 'text-orange-700',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          text: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          text: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          text: 'text-gray-700',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const colors = getColorClasses();

  useEffect(() => {
    if (showRetryTimer && error.type === 'usage_limit') {
      const calculateTimeLeft = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
      };

      setTimeLeft(calculateTimeLeft());
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [showRetryTimer, error.type]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${colors.bg} ${colors.border} border rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`${colors.icon} p-2 rounded-full bg-white shadow-sm`}>
              {getIcon()}
            </div>
            <h3 className={`text-lg font-semibold ${colors.title}`}>
              {error.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          <div className="mb-4">
            <p className={`${colors.text} mb-3 leading-relaxed`}>
              {error.message}
            </p>
            
            {/* Usage Limit Specific Info */}
            {error.type === 'usage_limit' && (
              <div className="bg-white rounded-lg p-4 mb-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-orange-800 mb-1">Why do we have limits?</h4>
                    <p className="text-sm text-orange-700">
                      AI analysis requires significant computational resources. Daily limits help us provide 
                      reliable service to all users while managing costs.
                    </p>
                    {timeLeft && (
                      <p className="text-sm font-medium text-orange-800 mt-2">
                        ⏰ Resets in: {timeLeft}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Suggestion */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-2">💡 What you can do:</h4>
              <p className="text-sm text-gray-700">
                {error.suggestion}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {error.action && (
              <button
                onClick={error.action.callback}
                className={`w-full ${colors.button} text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
              >
                <ExternalLink className="w-4 h-4" />
                {error.action.label}
              </button>
            )}
            
            {onRetry && error.type !== 'usage_limit' && (
              <button
                onClick={onRetry}
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {error.type === 'usage_limit' ? 'I Understand' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorFeedback;