import { useRef, useEffect, useState } from 'react';

/**
 * Hook for canvas drawing interactions.
 * Sets up pointer event handlers to allow freehand drawing.
 */
export default function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const toggleMode = () => setMode((m) => (m === 'draw' ? 'erase' : 'draw'));
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startDraw = (e: PointerEvent) => {
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
      canvas.style.cursor = 'crosshair';
    };
    const draw = (e: PointerEvent) => {
      if (!drawing.current) return;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'red';
      ctx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over';
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
  }, [mode]);

  return { canvasRef, mode, toggleMode, clear };
}
