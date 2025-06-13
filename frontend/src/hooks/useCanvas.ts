import { useRef, useEffect } from 'react';

/**
 * Hook for canvas drawing interactions.
 * Sets up pointer event handlers to allow freehand drawing.
 */
export default function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const startDraw = (e: PointerEvent) => {
      drawing.current = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };
    const draw = (e: PointerEvent) => {
      if (!drawing.current) return;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'red';
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };
    const stopDraw = () => {
      drawing.current = false;
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
  }, []);

  return { canvasRef };
}
