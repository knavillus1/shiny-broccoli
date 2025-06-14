import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import PromptInput from './PromptInput';

describe('PromptInput', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });
  it('submits valid prompt', () => {
    const submit = vi.fn();
    const { getByText, getByLabelText } = render(<PromptInput onSubmit={submit} />);
    const textarea = getByLabelText('Prompt');
    fireEvent.change(textarea, { target: { value: 'hello' } });
    fireEvent.submit(getByText('Submit').closest('form') as HTMLFormElement);
    expect(submit).toHaveBeenCalledWith('hello');
  });

  it('shows error on empty submission', () => {
    const { getByText } = render(<PromptInput />);
    fireEvent.submit(getByText('Submit').closest('form') as HTMLFormElement);
    expect(getByText('Error: Prompt is required')).toBeTruthy();
  });

  it('shows example prompts when none stored', () => {
    const { getByText } = render(<PromptInput />);
    expect(getByText(/Example prompts/i)).toBeTruthy();
  });

  it('renders placeholder text', () => {
    const { getByPlaceholderText } = render(<PromptInput />);
    expect(
      getByPlaceholderText('e.g. Remove the background')
    ).toBeTruthy();
  });

  it('stores prompt and displays recent list', () => {
    const { getByText, getByLabelText } = render(<PromptInput />);
    const textarea = getByLabelText('Prompt');
    fireEvent.change(textarea, { target: { value: 'hello' } });
    fireEvent.submit(getByText('Submit').closest('form') as HTMLFormElement);
    expect(localStorage.getItem('recentPrompts')).toContain('hello');
    expect(getByText(/Recent prompts/i)).toBeTruthy();
  });

  it('allows inserting suggestions', () => {
    const { getByText, getByLabelText } = render(<PromptInput />);
    fireEvent.click(getByText('Add a watermark'));
    const textarea = getByLabelText('Prompt') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Add a watermark');
  });
});
