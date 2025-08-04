// lib/errorHandler.ts
import type { ApiError, NotificationAction } from '~/types/notification';

export interface ErrorHandlerConfig {
  addNotification: (notification: any) => void;
  navigate?: (path: string) => void;
}

export const handleApiError = (error: any, config: ErrorHandlerConfig) => {
  const { addNotification, navigate } = config;

  // Check if it's the specific Puter API error structure
  if (error && typeof error === 'object' && error.success === false && error.error) {
    const apiError = error as ApiError;
    
    switch (apiError.error.code) {
      case 'error_400_from_delegate':
        if (apiError.error.delegate === 'usage-limited-chat') {
          handleUsageLimitError(addNotification, navigate);
        } else {
          handleGenericApiError(apiError, addNotification);
        }
        break;
        
      case 'auth_required':
        handleAuthError(addNotification, navigate);
        break;
        
      case 'file_not_found':
        handleFileError(addNotification);
        break;
        
      default:
        handleGenericApiError(apiError, addNotification);
    }
  } else if (error instanceof Error) {
    // Handle standard JavaScript errors
    handleJavaScriptError(error, addNotification);
  } else {
    // Handle unknown errors
    handleUnknownError(error, addNotification);
  }
};

const handleUsageLimitError = (addNotification: any, navigate?: any) => {
  const actions: NotificationAction[] = [
    {
      label: 'Upgrade to Pro',
      onClick: () => {
        navigate ? navigate('/premium') : window.location.href = '/premium';
      },
      variant: 'primary'
    },
    {
      label: 'Upgrade Puter',
      onClick: () => {
        window.open('https://puter.com/pricing', '_blank');
      },
      variant: 'secondary'
    }
  ];

  if (navigate) {
    actions.push({
      label: 'Go Home',
      onClick: () => navigate('/'),
      variant: 'secondary'
    });
  }

  addNotification({
    type: 'error',
    title: 'AI Usage Limit Reached',
    message: 'You\'ve reached your AI usage limit. Upgrade to Resume Analyzer Pro for unlimited analyses with advanced features, or upgrade your Puter plan for more AI credits.',
    duration: 0, // Persistent notification
    actions,
    dismissible: true,
  });
};

const handleAuthError = (addNotification: any, navigate?: any) => {
  const actions: NotificationAction[] = [
    {
      label: 'Sign In',
      onClick: () => {
        // This would trigger the Puter sign-in flow
        window.location.reload();
      },
      variant: 'primary'
    }
  ];

  addNotification({
    type: 'warning',
    title: 'Authentication Required',
    message: 'Please sign in to continue using the resume analyzer.',
    duration: 0,
    actions,
    dismissible: true,
  });
};

const handleFileError = (addNotification: any) => {
  addNotification({
    type: 'error',
    title: 'File Error',
    message: 'There was an error processing your file. Please try uploading again.',
    duration: 8000,
    actions: [
      {
        label: 'Try Again',
        onClick: () => window.location.reload(),
        variant: 'primary'
      }
    ],
    dismissible: true,
  });
};

const handleGenericApiError = (apiError: ApiError, addNotification: any) => {
  const errorMessage = apiError.error.message || 'An unexpected error occurred with the API.';
  
  addNotification({
    type: 'error',
    title: 'API Error',
    message: `${errorMessage} (Code: ${apiError.error.code})`,
    duration: 10000,
    dismissible: true,
  });
};

const handleJavaScriptError = (error: Error, addNotification: any) => {
  addNotification({
    type: 'error',
    title: 'Application Error',
    message: error.message || 'An unexpected error occurred.',
    duration: 8000,
    dismissible: true,
  });
};

const handleUnknownError = (error: any, addNotification: any) => {
  console.error('Unknown error:', error);
  
  addNotification({
    type: 'error',
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    duration: 8000,
    actions: [
      {
        label: 'Reload Page',
        onClick: () => window.location.reload(),
        variant: 'primary'
      }
    ],
    dismissible: true,
  });
};

// Utility function for success notifications
export const showSuccessNotification = (addNotification: any, title: string, message: string) => {
  addNotification({
    type: 'success',
    title,
    message,
    duration: 5000,
    dismissible: true,
  });
};

// Utility function for info notifications
export const showInfoNotification = (addNotification: any, title: string, message: string) => {
  addNotification({
    type: 'info',
    title,
    message,
    duration: 6000,
    dismissible: true,
  });
};

// Utility function for warning notifications
export const showWarningNotification = (addNotification: any, title: string, message: string) => {
  addNotification({
    type: 'warning',
    title,
    message,
    duration: 8000,
    dismissible: true,
  });
};