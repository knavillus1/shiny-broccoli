import { useRef, useEffect, useState } from 'react';

/**
 * Hook for canvas drawing interactions.
 * Sets up pointer event handlers to allow freehand drawing.
 */
export type BrushSize = 'small' | 'medium' | 'large';

export default function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [brushSize, setBrushSize] = useState<BrushSize>('medium');
  const toggleMode = () => setMode((m) => (m === 'draw' ? 'erase' : 'draw'));

  const fillWhite = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    fillWhite(ctx, canvas);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize mask with white so opaque regions are preserved
    fillWhite(ctx, canvas);
    canvas.style.opacity = '0.5';

    const startDraw = (e: PointerEvent) => {
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      canvas.style.cursor = 'crosshair';
    };
    const draw = (e: PointerEvent) => {
      if (!drawing.current) return;
      const widthMap = { small: 4, medium: 8, large: 12 } as const;
      ctx.lineWidth = widthMap[brushSize];
      ctx.lineCap = 'round';
      if (mode === 'draw') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'black';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'white';
      }
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };
    const stopDraw = () => {
      drawing.current = false;
      canvas.style.cursor = 'default';
    };

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDraw);
    canvas.addEventListener('pointerleave', stopDraw);

    return () => {
      canvas.removeEventListener('pointerdown', startDraw);
      canvas.removeEventListener('pointermove', draw);
      canvas.removeEventListener('pointerup', stopDraw);
      canvas.removeEventListener('pointerleave', stopDraw);
    };
  }, [mode, brushSize]);

  return { canvasRef, mode, toggleMode, clear, brushSize, setBrushSize };
}
