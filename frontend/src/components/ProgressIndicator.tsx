import React from 'react';

interface Props {
  message: string;
  etaSeconds?: number | null; // Changed from eta to etaSeconds to match expected prop
}

/**
 * Displays a simple progress indicator with optional message and progress percent.
 */
export default function ProgressIndicator({ message, etaSeconds }: Props) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-xl text-center">
        <p className="text-lg font-medium text-gray-900">{message}</p>
        {etaSeconds !== null && etaSeconds !== undefined && (
          <p className="text-sm text-gray-500 mt-2">
            Estimated time remaining: {etaSeconds} seconds
          </p>
        )}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-4"></div>
      </div>
    </div>
  );
}
