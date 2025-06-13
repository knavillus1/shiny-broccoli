import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import PromptInput from './PromptInput';

describe('PromptInput', () => {
  afterEach(() => {
    cleanup();
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
});
