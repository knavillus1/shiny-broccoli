import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

/**
 * Prompt input component with basic validation and character counter.
 */
export default function PromptInput({
  maxLength = 1000,
  onSubmit,
}: {
  maxLength?: number;
  onSubmit?: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const suggestions = [
    'Remove the background',
    'Change sky color to blue',
    'Add a watermark',
    'Increase brightness',
  ];

  useEffect(() => {
    const stored = localStorage.getItem('recentPrompts');
    if (stored) {
      try {
        setRecent(JSON.parse(stored));
      } catch {
        setRecent([]);
      }
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrompt(value);
    if (!value.trim()) {
      setError('Prompt is required');
    } else if (value.length > maxLength) {
      setError(`Prompt too long (${value.length}/${maxLength})`);
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || prompt.length > maxLength) {
      setError(!prompt.trim() ? 'Prompt is required' : 'Prompt too long');
      return;
    }
    const clean = prompt.trim();
    onSubmit?.(clean);
    const updated = [clean, ...recent.filter((p) => p !== clean)].slice(0, 5);
    setRecent(updated);
    localStorage.setItem('recentPrompts', JSON.stringify(updated));
    setPrompt('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <textarea
        aria-label="Prompt"
        placeholder="e.g. Remove the background"
        value={prompt}
        onChange={handleChange}
        maxLength={maxLength}
        className="w-full border rounded p-2 focus:outline focus:outline-blue-500"
      />
      <div className="text-sm text-gray-600 mt-1">
        {prompt.length}/{maxLength}
      </div>
      <div className="my-2">
        {recent.length === 0 ? (
          <div className="text-sm text-gray-600">
            Example prompts:
            <button
              type="button"
              aria-label="Use example prompt Remove the background"
              className="ml-2 underline focus:outline focus:outline-blue-500"
              onClick={() => setPrompt('Remove the background')}
            >
              Remove the background
            </button>
            ,
            <button
              type="button"
              aria-label="Use example prompt Change sky color"
              className="ml-1 underline focus:outline focus:outline-blue-500"
              onClick={() => setPrompt('Change sky color to blue')}
            >
              Change sky color
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            Recent prompts:
            {recent.map((p) => (
              <button
                key={p}
                type="button"
                aria-label={`Use recent prompt ${p}`}
                className="ml-2 underline focus:outline focus:outline-blue-500"
                onClick={() => setPrompt(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="text-sm text-gray-600">
        Suggestions:
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Use suggestion ${s}`}
            className="ml-2 underline focus:outline focus:outline-blue-500"
            onClick={() => setPrompt(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        type="submit"
        aria-label="Submit prompt"
        disabled={!prompt.trim() || prompt.length > maxLength}
        className="mt-2 px-2 py-1 border rounded focus:outline focus:outline-blue-500"
      >
        Submit
      </button>
      {error && <div className="mt-2 text-red-600">Error: {error}</div>}
    </form>
  );
}
