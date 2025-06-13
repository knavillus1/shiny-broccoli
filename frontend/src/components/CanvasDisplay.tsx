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
      // Scale image to fit within the parent container while preserving aspect
      // ratio. A max height is also enforced so very large images do not
      // overwhelm the page.
      const parent = canvas.parentElement as HTMLElement | null;
      const maxWidth = parent?.clientWidth ?? img.width;
      const maxHeight = 500; // limit height to keep canvas manageable
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
