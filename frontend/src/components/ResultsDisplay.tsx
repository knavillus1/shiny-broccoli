import React from 'react';

interface Props {
  original: string | File | null;
  result: string | File | null;
}

/**
 * Displays before and after images side by side.
 */
export default function ResultsDisplay({ original, result }: Props) {
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
    <div className="flex gap-4" aria-label="results-display">
      {origUrl ? <img src={origUrl} alt="original" className="max-w-xs" /> : <div>No original</div>}
      {resultUrl ? <img src={resultUrl} alt="result" className="max-w-xs" /> : <div>No result</div>}
    </div>
  );
}
