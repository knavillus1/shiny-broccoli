import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCanvas, { MAX_HISTORY } from './useCanvas';

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
    canvas.width = 10;
    canvas.height = 10;
    const clearRect = vi.fn();
    (canvas as any).getContext = vi.fn(
      () =>
        ({
          clearRect,
          getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(400) })), // 10x10x4 channels
          putImageData: vi.fn(),
          globalCompositeOperation: 'source-over',
          fillStyle: 'white',
        } as unknown as CanvasRenderingContext2D),
    );
    
    // Mock the ref assignment
    Object.defineProperty(result.current.canvasRef, 'current', {
      value: canvas,
      writable: true,
    });
    
    // Initialize the canvas first
    act(() => {
      result.current.initializeCanvasWithSize(10, 10);
    });
    act(() => {
      result.current.clear();
    });
    expect(clearRect).toHaveBeenCalled();
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

  it('supports undo and redo', () => {
    const { result } = renderHook(() => useCanvas());
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const putImageData = vi.fn();
    const getImageData = vi.fn(() => ({ data: new Uint8ClampedArray(400) })); // 10x10x4 channels
    (canvas as any).getContext = vi.fn(() =>
      ({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData,
        putImageData,
        globalCompositeOperation: 'source-over',
        fillStyle: 'white',
      } as unknown as CanvasRenderingContext2D),
    );
    
    // Mock the ref assignment
    Object.defineProperty(result.current.canvasRef, 'current', {
      value: canvas,
      writable: true,
    });

    // Initialize the canvas first
    act(() => {
      result.current.initializeCanvasWithSize(10, 10);
    });

    act(() => {
      result.current.clear();
    });
    expect(result.current.canUndo).toBe(true);

    act(() => {
      result.current.undo();
    });
    expect(putImageData).toHaveBeenCalled();

    act(() => {
      result.current.redo();
    });
    expect(putImageData).toHaveBeenCalledTimes(2);
  });

  it('limits undo history to MAX_HISTORY', () => {
    const { result } = renderHook(() => useCanvas());
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(400) })), // 10x10x4 channels
      putImageData: vi.fn(),
      globalCompositeOperation: 'source-over',
      fillStyle: 'white',
    } as unknown as CanvasRenderingContext2D;
    (canvas as any).getContext = vi.fn(() => ctx);
    
    // Mock the ref assignment
    Object.defineProperty(result.current.canvasRef, 'current', {
      value: canvas,
      writable: true,
    });

    // Initialize the canvas first
    act(() => {
      result.current.initializeCanvasWithSize(10, 10);
    });

    for (let i = 0; i < MAX_HISTORY + 5; i++) {
      act(() => {
        result.current.clear();
      });
    }

    let count = 0;
    while (result.current.canUndo) {
      act(() => {
        result.current.undo();
      });
      count += 1;
    }
    expect(count).toBe(MAX_HISTORY - 1); // -1 because the initial state takes one slot
  });
});
