import React from 'react';

interface Props {
  message?: string;
  progress?: number; // 0-100
}

/**
 * Displays a simple progress indicator with optional message and progress percent.
 */
export default function ProgressIndicator({ message = 'Loading...', progress }: Props) {
  return (
    <div className="flex items-center gap-2" aria-label="progress-indicator">
      <svg
        className="animate-spin h-5 w-5 text-gray-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>{message}</span>
      {progress !== undefined && <span>{progress}%</span>}
    </div>
  );
}
