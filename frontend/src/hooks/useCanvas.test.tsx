import { describe, it, expect, vi } from 'vitest';
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

  it('clears the canvas', () => {
    const { result } = renderHook(() => useCanvas());
    const canvas = document.createElement('canvas');
    const clearRect = vi.fn();
    canvas.getContext = vi.fn(() => ({ clearRect } as unknown as CanvasRenderingContext2D));
    result.current.canvasRef.current = canvas;
    act(() => {
      result.current.clear();
    });
    expect(clearRect).toHaveBeenCalled();
  });
});
