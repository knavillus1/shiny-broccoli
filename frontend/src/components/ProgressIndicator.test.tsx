import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProgressIndicator from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders with default message', () => {
    const { getByText, getByLabelText } = render(<ProgressIndicator />);
    expect(getByLabelText('progress-indicator')).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows custom message and progress', () => {
    const { getByText } = render(
      <ProgressIndicator message="Processing" progress={50} etaSeconds={10} />,
    );
    expect(getByText('Processing')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('ETA: 10s')).toBeTruthy();
  });
});
