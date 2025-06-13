import { useEffect, useRef } from 'react';

/**
 * Displays an uploaded image on an HTML5 canvas.
 *
 * @param image The image file to render, or null if none uploaded.
 */

export default function CanvasDisplay({ image }: { image: File | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = URL.createObjectURL(image);
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [image]);

  return (
    <div className="border rounded p-4 mt-4">
      {image ? (
        <canvas ref={canvasRef} className="border" />
      ) : (
        <div>No image uploaded yet.</div>
      )}
    </div>
  );
}
