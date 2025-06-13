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
    const fillRect = vi.fn();
    canvas.getContext = vi.fn(() => ({ fillRect, globalCompositeOperation: 'source-over', fillStyle: 'white' } as unknown as CanvasRenderingContext2D));
    result.current.canvasRef.current = canvas;
    act(() => {
      result.current.clear();
    });
    expect(fillRect).toHaveBeenCalled();
  });

  it('updates brush size', () => {
    const { result } = renderHook(() => useCanvas());
    act(() => {
      result.current.setBrushSize('large');
    });
    expect(result.current.brushSize).toBe('large');
  });

  it('updates drawing tool', () => {
    const { result } = renderHook(() => useCanvas());
    act(() => {
      result.current.setTool('rectangle');
    });
    expect(result.current.tool).toBe('rectangle');
  });
});
