import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render } from '@testing-library/react';
import ResultsDisplay from './ResultsDisplay';

describe('ResultsDisplay', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:url');
  });
  it('shows placeholders when no images provided', () => {
    const { getByText } = render(<ResultsDisplay original={null} result={null} />);
    expect(getByText('No original')).toBeTruthy();
    expect(getByText('No result')).toBeTruthy();
  });

  it('renders provided images', () => {
    const file = new File(['data'], 'orig.png', { type: 'image/png' });
    const { getAllByRole } = render(<ResultsDisplay original={file} result={file} />);
    expect(getAllByRole('img').length).toBe(2);
  });
});
