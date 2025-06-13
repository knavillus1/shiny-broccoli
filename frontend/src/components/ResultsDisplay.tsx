import React, { useState } from 'react';

interface Props {
  original: string | File | null;
  result: string | File | null;
  error?: string;
}

/**
 * Displays before and after images side by side.
 */
export default function ResultsDisplay({ original, result, error }: Props) {
  const [mode, setMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  const origUrl =
    typeof original === 'string'
      ? original
      : original
      ? URL.createObjectURL(original)
      : null;
  const resultUrl =
    typeof result === 'string'
      ? result
      : result
      ? URL.createObjectURL(result)
      : null;
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          setMode((m) => (m === 'side-by-side' ? 'overlay' : 'side-by-side'))
        }
        className="mb-2 px-2 py-1 border rounded"
      >
        {mode === 'side-by-side' ? 'Overlay' : 'Side by Side'}
      </button>
      {resultUrl && (
        <a
          href={resultUrl}
          download="result.png"
          className="ml-2 underline"
          aria-label="download-result"
        >
          Download
        </a>
      )}
      {mode === 'side-by-side' ? (
        <div className="flex gap-4" aria-label="results-display" data-mode="side-by-side">
          {origUrl ? <img src={origUrl} alt="original" className="max-w-xs" /> : <div>No original</div>}
          {resultUrl ? (
            <img src={resultUrl} alt="result" className="max-w-xs" />
          ) : error ? (
            <div className="text-red-600">Error: {error}</div>
          ) : (
            <div>No result</div>
          )}
        </div>
      ) : (
        <div
          className="relative inline-block"
          aria-label="results-display"
          data-mode="overlay"
        >
          {origUrl ? (
            <img src={origUrl} alt="original" className="max-w-xs block" />
          ) : (
            <div>No original</div>
          )}
          {resultUrl ? (
            <img
              src={resultUrl}
              alt="result"
              className="max-w-xs absolute left-0 top-0 opacity-50"
            />
          ) : error ? (
            <div className="absolute left-0 top-0 text-red-600">Error: {error}</div>
          ) : (
            <div className="absolute left-0 top-0">No result</div>
          )}
        </div>
      )}
    </div>
  );
}
