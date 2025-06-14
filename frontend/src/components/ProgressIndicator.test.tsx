import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProgressIndicator from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders with default message', () => {
    const { getByText, container } = render(<ProgressIndicator message="Loading..." />);
    expect(container.querySelector('.bg-white')).toBeTruthy(); // Check for the modal container
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('shows custom message and progress', () => {
    const { getByText } = render(
      <ProgressIndicator message="Processing" etaSeconds={10} />,
    );
    expect(getByText('Processing')).toBeTruthy();
    expect(getByText('Estimated time remaining: 10 seconds')).toBeTruthy();
  });
});
