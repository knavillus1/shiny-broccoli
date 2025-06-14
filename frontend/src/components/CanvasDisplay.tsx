import { useEffect, useRef, useState, useCallback } from 'react';
import ProgressIndicator from './ProgressIndicator';
import { editImage } from '../services/apiClient';
import { BrushSize as MaskBrushSizeType, Tool as MaskToolType } from '../hooks/useCanvas';

interface Props {
  image: File | null;
  prompt: string;
  onResult?: (file: File) => void;
  onError?: (msg: string) => void;
  onRequestId?: (id: string) => void;
  onSubmitReady?: (submitHandler: () => Promise<void>) => void;

  maskCanvasRef: React.RefObject<HTMLCanvasElement>;
  onMaskCanvasReady: (width: number, height: number) => void;
  isMaskCanvasInitialized: boolean;
  drawBrushStroke: (x: number, y: number, isStartingPath: boolean) => void;
  drawShape: (x1: number, y1: number, x2: number, y2: number) => void;
  saveMaskState: () => void;
  maskTool: MaskToolType;
  maskBrushSize: MaskBrushSizeType;
  maskMode: 'draw' | 'erase';
  setMaskStartPosition: (pos: { x: number; y: number } | null) => void;
  getMaskStartPosition: () => { x: number; y: number } | null;

  toggleMaskMode: () => void;
  clearMask: () => void;
  undoMask: () => void;
  redoMask: () => void;
  canUndoMask: boolean;
  canRedoMask: boolean;
}

export default function CanvasDisplay({
  image,
  prompt,
  onResult,
  onError,
  onRequestId,
  onSubmitReady,
  maskCanvasRef,
  onMaskCanvasReady,
  isMaskCanvasInitialized,
  drawBrushStroke,
  drawShape,
  saveMaskState,
  maskTool,
  maskBrushSize, // Keep this prop, it's used for display and potentially by drawing logic if not fully encapsulated
  maskMode,
  setMaskStartPosition,
  getMaskStartPosition,
  toggleMaskMode,
  clearMask: clearMaskAction,
  undoMask: undoMaskAction,
  redoMask: redoMaskAction,
  canUndoMask: canUndoMaskFlag,
  canRedoMask: canRedoMaskFlag,
}: Props) {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const [maskVisible, setMaskVisible] = useState(true);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = baseRef.current;

    if (!image) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (maskCanvasRef.current && isMaskCanvasInitialized) {
        const maskCtx = maskCanvasRef.current.getContext('2d');
        maskCtx?.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
      return;
    }

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      if (img.width === 0 || img.height === 0) {
        console.error("Image has zero dimensions:", image.name);
        if (onError) onError(`Image has zero dimensions: ${image.name}`);
        return;
      }

      const parent = canvas.parentElement?.parentElement as HTMLElement | null;
      const contentContainer = document.querySelector('.content-container') as HTMLElement | null;
      
      let availableWidth = img.width;
      if (contentContainer) {
        availableWidth = contentContainer.clientWidth;
      } else if (parent) {
        availableWidth = parent.clientWidth;
      }

      const availableHeight = contentContainer?.clientHeight || window.innerHeight - 250;
      const scale = Math.min(availableWidth / img.width, availableHeight / img.height, 1);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (maskCanvasRef.current) {
        // Ensure mask canvas has the same dimensions as the base canvas
        maskCanvasRef.current.width = canvas.width;
        maskCanvasRef.current.height = canvas.height;
        onMaskCanvasReady(canvas.width, canvas.height);
      }
    };
    img.onerror = () => {
      console.error("Failed to load image:", image.name);
      if (onError) onError(`Failed to load image: ${image.name}`);
    };

    img.src = URL.createObjectURL(image);

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [image, maskCanvasRef, onMaskCanvasReady, isMaskCanvasInitialized, onError]); // Added onError to dependencies

  const getCanvasCoordinates = (event: React.MouseEvent<HTMLDivElement>): { x: number, y: number } | null => {
    // Use baseRef for coordinate calculations relative to the image canvas
    if (!baseRef.current) return null;
    const rect = baseRef.current.getBoundingClientRect();
    const coords = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    console.log(`Coords: click(${event.clientX},${event.clientY}) -> canvas(${coords.x},${coords.y})`);
    return coords;
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isMaskCanvasInitialized || event.button !== 0) return; 
    const coords = getCanvasCoordinates(event);
    if (!coords) return;

    setIsDrawing(true);
    if (maskTool === 'brush') {
      drawBrushStroke(coords.x, coords.y, true); // true for isStartingPath
    } else if (maskTool === 'rectangle' || maskTool === 'circle') {
      setMaskStartPosition(coords);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !isMaskCanvasInitialized) return;
    const coords = getCanvasCoordinates(event);
    if (!coords) return;

    if (maskTool === 'brush') {
      drawBrushStroke(coords.x, coords.y, false); // false for continuing path
    }
    // Note: For rectangle/circle tools, we draw the final shape on mouseUp for simplicity
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !isMaskCanvasInitialized || event.button !== 0) return;
    setIsDrawing(false);
    const coords = getCanvasCoordinates(event);

    if (maskTool === 'brush') {
      // Stroke already done in mouseMove.
    } else if ((maskTool === 'rectangle' || maskTool === 'circle') && coords) {
      const startCoords = getMaskStartPosition();
      if (startCoords) {
        drawShape(startCoords.x, startCoords.y, coords.x, coords.y);
      }
    }
    saveMaskState();
    setMaskStartPosition(null);
  };
  
  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing) {
        handleMouseUp(event); 
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!image || !maskCanvasRef.current || !baseRef.current || !isMaskCanvasInitialized) return;
    setSubmitting(true);
    setSubmitMsg('Processing...');
    setSubmitError('');
    setEta(null);
    try {
      const [maskBlob, imgBlob] = await Promise.all([
        new Promise<Blob | null>((resolve) =>
          maskCanvasRef.current!.toBlob(resolve, 'image/png')
        ),
        new Promise<Blob | null>((resolve) =>
          baseRef.current!.toBlob(resolve, 'image/png')
        ),
      ]);
      const maskFile = maskBlob
        ? new File([maskBlob], 'mask.png', { type: 'image/png' })
        : undefined;
      const imageFile = imgBlob
        ? new File([imgBlob], 'image.png', { type: 'image/png' })
        : image;
      const result = await editImage(imageFile, prompt || 'Edit', maskFile);
      setEta(result.eta_seconds ?? null);
      if (result.request_id) {
        onRequestId?.(result.request_id);
      }
      // onResult is for the final edited image, not the mask preview
      setSubmitMsg(result.detail || 'Processing complete');
    } catch (err) {
      const msg = (err as Error).message;
      setSubmitError(msg);
      onError?.(msg);
    } finally {
      setSubmitting(false);
    }
  }, [image, maskCanvasRef, baseRef, isMaskCanvasInitialized, prompt, onRequestId, onError]);

  // Expose the submit handler to parent component
  useEffect(() => {
    if (onSubmitReady) {
      onSubmitReady(handleSubmit);
    }
  }, [onSubmitReady, handleSubmit]);

  return (
    <div className="border rounded p-4 mt-4">
      {image ? (
        <>
          <div className="mb-2 flex items-center gap-2">
            <button type="button" onClick={toggleMaskMode} className="px-2 py-1 border rounded focus:outline focus:outline-blue-500">
              {maskMode === 'draw' ? 'Switch to Erase' : 'Switch to Draw'}
            </button>
            <button type="button" onClick={() => setMaskVisible((v) => !v)} className="px-2 py-1 border rounded focus:outline focus:outline-blue-500">
              {maskVisible ? 'Hide Mask' : 'Show Mask'}
            </button>
            <button type="button" onClick={clearMaskAction} className="px-2 py-1 border rounded focus:outline focus:outline-blue-500">
              Clear Mask
            </button>
            <button type="button" onClick={undoMaskAction} disabled={!canUndoMaskFlag} className="px-2 py-1 border rounded focus:outline focus:outline-blue-500">
              Undo
            </button>
            <button type="button" onClick={redoMaskAction} disabled={!canRedoMaskFlag} className="px-2 py-1 border rounded focus:outline focus:outline-blue-500">
              Redo
            </button>
            <span className="text-sm text-gray-600">Mode: {maskMode}</span>
            <span className="text-sm text-gray-600">Tool: {maskTool}</span>
          </div>
          <div 
            className="relative inline-block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{ 
              cursor: (maskTool === 'brush' || maskTool === 'rectangle' || maskTool === 'circle') && isMaskCanvasInitialized ? 'crosshair' : 'default',
              position: 'relative', // Explicitly set relative positioning for absolute child positioning
            }}
          >
            <canvas
              ref={baseRef}
              id="image-canvas"
              style={{ display: image ? 'block' : 'none' }}
              className="border block"
            />
            {image && (
              <canvas
                ref={maskCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  display: maskVisible && isMaskCanvasInitialized ? 'block' : 'none',
                  opacity: 0.7, 
                  touchAction: 'none',
                  pointerEvents: 'none',
                }}
                className="border block"
              />
            )}
            {submitting && <ProgressIndicator message={submitMsg} etaSeconds={eta} />}
          </div>
          {submitError && <p className="error-message">{submitError}</p>}
        </>
      ) : null /* HomePage handles the placeholder if no image */}
    </div>
  );
}
