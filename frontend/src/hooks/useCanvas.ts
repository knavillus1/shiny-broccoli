import { useRef, useEffect, useState } from 'react';

/**
 * Hook for canvas drawing interactions.
 * Sets up pointer event handlers to allow freehand drawing.
 */
export type BrushSize = 'small' | 'medium' | 'large';
export type Tool = 'brush' | 'rectangle' | 'circle';

export default function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [brushSize, setBrushSize] = useState<BrushSize>('medium');
  const [tool, setTool] = useState<Tool>('brush');
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
      startPos.current = { x: e.offsetX, y: e.offsetY };
      if (tool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
      }
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
        ctx.fillStyle = 'black';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
      }
      if (tool === 'brush') {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
      }
    };
    const stopDraw = (e: PointerEvent) => {
      if (!drawing.current) return;
      drawing.current = false;
      const start = startPos.current;
      startPos.current = null;
      if (tool === 'rectangle' && start) {
        const w = e.offsetX - start.x;
        const h = e.offsetY - start.y;
        ctx.beginPath();
        ctx.rect(start.x, start.y, w, h);
        ctx.fill();
      } else if (tool === 'circle' && start) {
        const r = Math.hypot(e.offsetX - start.x, e.offsetY - start.y);
        ctx.beginPath();
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
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
  }, [mode, brushSize, tool]);

  return {
    canvasRef,
    mode,
    toggleMode,
    clear,
    brushSize,
    setBrushSize,
    tool,
    setTool,
  };
}
