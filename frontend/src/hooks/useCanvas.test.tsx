import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCanvas from './useCanvas';

describe('useCanvas', () => {
  it('toggles drawing mode', () => {
    const { result } = renderHook(() => useCanvas());
    expect(result.current.mode).toBe('draw');
    act(() => {
      result.current.toggleMode();
    });
    expect(result.current.mode).toBe('erase');
  });
});
