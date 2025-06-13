import { useEffect, useRef, useState } from 'react';
import useCanvas from '../hooks/useCanvas';
import { processImage } from '../services/apiClient';

/**
 * Displays an uploaded image on an HTML5 canvas.
 *
 * @param image The image file to render, or null if none uploaded.
 */

export default function CanvasDisplay({ image }: { image: File | null }) {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const { canvasRef: maskRef, mode, toggleMode } = useCanvas();
  const [maskVisible, setMaskVisible] = useState(true);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const canvas = baseRef.current;
    if (!canvas || !image) return;
    const maskCanvas = maskRef.current;
    if (!maskCanvas) return;
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
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const mctx = maskCanvas.getContext('2d');
      mctx?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    };
    img.src = URL.createObjectURL(image);
    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [image]);

  const handleSubmit = async () => {
    if (!image || !maskRef.current) return;
    setSubmitting(true);
    setSubmitMsg('Processing...');
    setSubmitError('');
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        maskRef.current!.toBlob(resolve, 'image/png')
      );
      const maskFile = blob
        ? new File([blob], 'mask.png', { type: 'image/png' })
        : undefined;
      const result = await processImage(image, maskFile);
      setSubmitMsg(result.detail || 'Processing complete');
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border rounded p-4 mt-4">
      {image ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMode}
              className="px-2 py-1 border rounded"
            >
              {mode === 'draw' ? 'Switch to Erase' : 'Switch to Draw'}
            </button>
            <button
              type="button"
              onClick={() => setMaskVisible((v) => !v)}
              className="px-2 py-1 border rounded"
            >
              {maskVisible ? 'Hide Mask' : 'Show Mask'}
            </button>
            <span className="text-sm text-gray-600">Mode: {mode}</span>
          </div>
          <div className="relative inline-block">
            <canvas ref={baseRef} className="border block" />
            <canvas
              ref={maskRef}
              className={`border absolute left-0 top-0 ${maskVisible ? '' : 'hidden'}`}
            />
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="mt-2 px-2 py-1 border rounded"
          >
            Submit
          </button>
          {submitMsg && <div className="mt-2 text-green-600">{submitMsg}</div>}
          {submitError && <div className="mt-2 text-red-600">Error: {submitError}</div>}
        </>
      ) : (
        <div>No image uploaded yet.</div>
      )}
    </div>
  );
}
