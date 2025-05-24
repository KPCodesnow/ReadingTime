import React, { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  error?: string | null;
  isLoading?: boolean;
  retryAction?: () => void;
  delay?: number; // Add delay prop to prevent flash
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  error = null,
  isLoading = true,
  retryAction,
  delay = 200 // Default delay of 200ms
}: LoadingSpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowSpinner(true);
      }, delay);
    } else {
      setShowSpinner(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, delay]);

  if (!showSpinner && !error) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-[9999]"
      style={{ 
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      {showSpinner && (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 text-sm font-medium">{message}</p>
          <p className="text-gray-400 text-xs mt-2">Please wait...</p>
        </>
      )}
      
      {!isLoading && error && (
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          {retryAction && (
            <button 
              onClick={retryAction}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
} 