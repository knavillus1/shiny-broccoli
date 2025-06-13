import { useState, FormEvent, ChangeEvent } from 'react';

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
    onSubmit?.(prompt.trim());
    setPrompt('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <textarea
        aria-label="Prompt"
        value={prompt}
        onChange={handleChange}
        maxLength={maxLength}
        className="w-full border rounded p-2"
      />
      <div className="text-sm text-gray-600 mt-1">
        {prompt.length}/{maxLength}
      </div>
      <button
        type="submit"
        disabled={!prompt.trim() || prompt.length > maxLength}
        className="mt-2 px-2 py-1 border rounded"
      >
        Submit
      </button>
      {error && <div className="mt-2 text-red-600">Error: {error}</div>}
    </form>
  );
}
