// Error types and handling utilities
export interface APIError {
  error: {
    delegate: string;
    message: string;
    code: string;
    status: number;
  };
  success: boolean;
}

export interface ErrorInfo {
  type: 'usage_limit' | 'permission' | 'network' | 'validation' | 'server' | 'unknown';
  title: string;
  message: string;
  suggestion: string;
  icon: string;
  color: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

export const parseAPIError = (error: any): ErrorInfo => {
  // Handle Puter API errors
  if (error?.error?.delegate === 'usage-limited-chat') {
    return {
      type: 'usage_limit',
      title: 'Usage Limit Reached',
      message: 'You\'ve reached your AI analysis limit for today. Your account has a daily quota for CV analysis to ensure fair usage.',
      suggestion: 'Please try again tomorrow or upgrade your account for higher limits. You can still download and manage your existing analyses.',
      icon: '⏰',
      color: 'orange',
      action: {
        label: 'Learn More About Limits',
        callback: () => window.open('/pricing', '_blank')
      }
    };
  }

  if (error?.error?.code === 'error_400_from_delegate') {
    return {
      type: 'permission',
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action. This might be due to account restrictions or service limitations.',
      suggestion: 'Please check your account status or contact support if this persists.',
      icon: '🔒',
      color: 'red'
    };
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return {
      type: 'network',
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      suggestion: 'Try refreshing the page or check your network connection.',
      icon: '🌐',
      color: 'blue'
    };
  }

  // Handle validation errors
  if (error?.message?.includes('validation') || error?.status === 422) {
    return {
      type: 'validation',
      title: 'Invalid Input',
      message: 'The information provided doesn\'t meet our requirements.',
      suggestion: 'Please check your input and try again.',
      icon: '⚠️',
      color: 'yellow'
    };
  }

  // Handle server errors
  if (error?.status >= 500) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'Our servers are experiencing issues. This is temporary and we\'re working to fix it.',
      suggestion: 'Please try again in a few minutes.',
      icon: '🔧',
      color: 'red'
    };
  }

  // Default unknown error
  return {
    type: 'unknown',
    title: 'Something Went Wrong',
    message: error?.message || 'An unexpected error occurred while processing your request.',
    suggestion: 'Please try again. If the problem persists, contact our support team.',
    icon: '❌',
    color: 'gray'
  };
};

export const getRetryDelay = (errorType: string): number => {
  switch (errorType) {
    case 'usage_limit':
      return 24 * 60 * 60 * 1000; // 24 hours
    case 'server':
      return 5 * 60 * 1000; // 5 minutes
    case 'network':
      return 30 * 1000; // 30 seconds
    default:
      return 60 * 1000; // 1 minute
  }
};
