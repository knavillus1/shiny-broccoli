import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    (console.error as unknown as { mockRestore: () => void }).mockRestore();
  });
  it('renders fallback when child throws', () => {
    const Problem = () => {
      throw new Error('boom');
    };
    const { getByRole, getByText } = render(
      <ErrorBoundary>
        <Problem />
      </ErrorBoundary>
    );
    expect(getByRole('alert')).toBeTruthy();
    expect(getByText(/Something went wrong/i)).toBeTruthy();
  });

  it('resets after clicking try again', async () => {
    let fail = true;
    const Problem = () => {
      if (fail) throw new Error('boom');
      return <div>ok</div>;
    };
    const { getAllByRole, getAllByText, findByText, rerender } = render(
      <ErrorBoundary key="one">
        <Problem />
      </ErrorBoundary>
    );
    expect(getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    fail = false;
    fireEvent.click(getAllByText('Try again')[0]);
    rerender(
      <ErrorBoundary key="two">
        <Problem />
      </ErrorBoundary>
    );
    expect(await findByText('ok')).toBeTruthy();
  });
});
