import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import ResultsDisplay from './ResultsDisplay';

describe('ResultsDisplay', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:url');
  });
  afterEach(() => {
    cleanup();
  });
  it('shows placeholders when no images provided', () => {
    const { getByText } = render(<ResultsDisplay original={null} result={null} />);
    expect(getByText('No original')).toBeTruthy();
    expect(getByText('No result')).toBeTruthy();
  });

  it('renders provided images', () => {
    const file = new File(['data'], 'orig.png', { type: 'image/png' });
    const { getAllByRole, getByText, getByLabelText } = render(
      <ResultsDisplay original={file} result={file} />
    );
    let container = getByLabelText('results-display');
    expect(container.getAttribute('data-mode')).toBe('side-by-side');
    expect(getAllByRole('img').length).toBe(2);
    fireEvent.click(getByText('Overlay'));
    container = getByLabelText('results-display');
    expect(container.getAttribute('data-mode')).toBe('overlay');
  });
});
