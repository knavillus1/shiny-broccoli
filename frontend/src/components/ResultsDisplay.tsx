import React, { useState, useEffect } from 'react';

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
  const [origUrl, setOrigUrl] = useState<string | null>(
    typeof original === 'string' ? original : null,
  );
  const [resultUrl, setResultUrl] = useState<string | null>(
    typeof result === 'string' ? result : null,
  );

  useEffect(() => {
    if (typeof original === 'string' || !original) {
      setOrigUrl(original || null);
      return;
    }
    const url = URL.createObjectURL(original);
    setOrigUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [original]);

  useEffect(() => {
    if (typeof result === 'string' || !result) {
      setResultUrl(result || null);
      return;
    }
    const url = URL.createObjectURL(result);
    setResultUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [result]);
  return (
    <div>
      <button
        type="button"
        aria-label="Toggle result display mode"
        onClick={() =>
          setMode((m) => (m === 'side-by-side' ? 'overlay' : 'side-by-side'))
        }
        className="mb-2 px-2 py-1 border rounded focus:outline focus:outline-blue-500"
      >
        {mode === 'side-by-side' ? 'Overlay' : 'Side by Side'}
      </button>
      {resultUrl && (
        <a
          href={resultUrl}
          download="result.png"
          className="ml-2 underline focus:outline focus:outline-blue-500"
          aria-label="download-result"
        >
          Download
        </a>
      )}
      {mode === 'side-by-side' ? (
        <div className="flex gap-4" aria-label="results-display" data-mode="side-by-side">
          {origUrl ? (
            <img src={origUrl} alt="original" className="max-w-xs" loading="lazy" />
          ) : (
            <div>No original</div>
          )}
          {resultUrl ? (
            <img src={resultUrl} alt="result" className="max-w-xs" loading="lazy" />
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
            <img src={origUrl} alt="original" className="max-w-xs block" loading="lazy" />
          ) : (
            <div>No original</div>
          )}
          {resultUrl ? (
            <img
              src={resultUrl}
              alt="result"
              className="max-w-xs absolute left-0 top-0 opacity-50"
              loading="lazy"
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
