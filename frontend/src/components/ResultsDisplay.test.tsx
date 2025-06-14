import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import ResultsDisplay from './ResultsDisplay';

describe('ResultsDisplay', () => {
  beforeAll(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:url');
    global.URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it('shows placeholders when no images provided', () => {
    const { getByText } = render(<ResultsDisplay original={null} result={null} />);
    expect(getByText('No original')).toBeTruthy();
    expect(getByText('No result')).toBeTruthy();
  });

  it('displays error message when provided', () => {
    const { getByText } = render(
      <ResultsDisplay original={null} result={null} error="oops" />,
    );
    expect(getByText('Error: oops')).toBeTruthy();
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

  it('provides a download link for the result', () => {
    const file = new File(['data'], 'res.png', { type: 'image/png' });
    const { getByLabelText } = render(
      <ResultsDisplay original={file} result={file} />
    );
    const link = getByLabelText('download-result') as HTMLAnchorElement;
    expect(link.href).toContain('blob:url');
    expect(link.getAttribute('download')).toBe('result.png');
  });

  it('revokes object URLs on unmount', () => {
    const file = new File(['data'], 'res.png', { type: 'image/png' });
    const { unmount } = render(
      <ResultsDisplay original={file} result={file} />
    );
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });
});
