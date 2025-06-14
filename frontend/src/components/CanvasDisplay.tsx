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
  onProcessingStart?: () => void;

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
  
  // Mask visibility control
  maskVisible?: boolean;
  toggleMaskVisibility?: () => void;
}

export default function CanvasDisplay({
  image,
  prompt,
  onResult,
  onError,
  onRequestId,
  onSubmitReady,
  onProcessingStart,
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
  maskVisible = true,
  toggleMaskVisibility,
}: Props) {
  const baseRef = useRef<HTMLCanvasElement>(null);
  const submitHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [eta, setEta] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState<{width: number, height: number} | null>(null);

  useEffect(() => {
    const canvas = baseRef.current;

    if (!image) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (maskCanvasRef?.current && isMaskCanvasInitialized) {
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
        if (onError) onError(`Image has zero dimensions: ${image.name}`);
        return;
      }

      // Calculate a reasonable display size (similar to max-w-xs which is ~320px)
      const maxDisplaySize = 320;
      const aspectRatio = img.width / img.height;
      let displayWidth, displayHeight;
      
      // Store original dimensions for mask scaling
      setOriginalImageSize({ width: img.width, height: img.height });
      
      if (img.width > img.height) {
        displayWidth = Math.min(img.width, maxDisplaySize);
        displayHeight = displayWidth / aspectRatio;
      } else {
        displayHeight = Math.min(img.height, maxDisplaySize);
        displayWidth = displayHeight * aspectRatio;
      }
      
      // Set canvas to display size, not full resolution
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (maskCanvasRef?.current) {
        const oldWidth = maskCanvasRef.current.width;
        const oldHeight = maskCanvasRef.current.height;
        
        // Store existing mask data if canvas was already initialized
        let existingMaskData: ImageData | null = null;
        const maskCtx = maskCanvasRef.current.getContext('2d');
        if (maskCtx && isMaskCanvasInitialized && oldWidth > 0 && oldHeight > 0) {
          try {
            existingMaskData = maskCtx.getImageData(0, 0, oldWidth, oldHeight);
          } catch (e) {
            // Could not preserve existing mask data
          }
        }
        
        // Set mask canvas to same dimensions as image
        maskCanvasRef.current.width = canvas.width;
        maskCanvasRef.current.height = canvas.height;
        
        // If we have existing mask data and the canvas size hasn't changed, restore it
        if (existingMaskData && oldWidth === canvas.width && oldHeight === canvas.height && maskCtx) {
          try {
            maskCtx.putImageData(existingMaskData, 0, 0);
          } catch (e) {
            maskCtx.clearRect(0, 0, canvas.width, canvas.height);
          }
        } else if (maskCtx) {
          // Only clear if size changed or no existing data
          maskCtx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        onMaskCanvasReady(canvas.width, canvas.height);
      }
    };
    img.onerror = () => {
      if (onError) onError(`Failed to load image: ${image.name}`);
    };

    img.src = URL.createObjectURL(image);

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [image, maskCanvasRef, onMaskCanvasReady, isMaskCanvasInitialized, onError]); // Added onError to dependencies

  const getCanvasCoordinates = useCallback((event: React.MouseEvent<HTMLDivElement>): { x: number, y: number } | null => {
    // Use baseRef for coordinate calculations relative to the image canvas
    if (!baseRef.current) return null;
    const rect = baseRef.current.getBoundingClientRect();
    
    const coords = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    return coords;
  }, []);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isMaskCanvasInitialized || event.button !== 0) return; 
    const coords = getCanvasCoordinates(event);
    if (!coords) return;

    setIsDrawing(true);
    if (maskTool === 'brush') {
      drawBrushStroke(coords.x, coords.y, true); // true for isStartingPath
    } else if (maskTool === 'rectangle' || maskTool === 'circle') {
      setMaskStartPosition(coords);
    }
  }, [isMaskCanvasInitialized, maskTool, drawBrushStroke, setMaskStartPosition, getCanvasCoordinates]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !isMaskCanvasInitialized) return;
    const coords = getCanvasCoordinates(event);
    if (!coords) return;

    if (maskTool === 'brush') {
      drawBrushStroke(coords.x, coords.y, false); // false for continuing path
    }
    // Note: For rectangle/circle tools, we draw the final shape on mouseUp for simplicity
  }, [isDrawing, isMaskCanvasInitialized, maskTool, drawBrushStroke, getCanvasCoordinates]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
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
  }, [isDrawing, isMaskCanvasInitialized, maskTool, getMaskStartPosition, drawShape, saveMaskState, setMaskStartPosition, getCanvasCoordinates]);
  
  const handleMouseLeave = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing) {
        handleMouseUp(event); 
    }
  }, [isDrawing, handleMouseUp]);

  // Convert mask canvas to proper RGBA format for OpenAI
  const convertMaskToRGBA = useCallback(async (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !originalImageSize) return null;
    
    // Create a canvas at the original image size for the final mask
    const fullSizeCanvas = document.createElement('canvas');
    fullSizeCanvas.width = originalImageSize.width;
    fullSizeCanvas.height = originalImageSize.height;
    const fullSizeCtx = fullSizeCanvas.getContext('2d');
    if (!fullSizeCtx) return null;
    
    // Scale the mask up to the original image size
    fullSizeCtx.imageSmoothingEnabled = false; // Preserve crisp edges for masks
    fullSizeCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, originalImageSize.width, originalImageSize.height);
    
    // Get the scaled-up mask data
    const imageData = fullSizeCtx.getImageData(0, 0, originalImageSize.width, originalImageSize.height);
    const data = imageData.data;
    
    // Create a new ImageData for the RGBA mask
    const maskData = new ImageData(originalImageSize.width, originalImageSize.height);
    const mask = maskData.data;
    
    let drawnPixels = 0;
    
    // Convert the mask: 
    // - Areas that were drawn (have any opacity) become transparent (alpha=0) - to be edited
    // - Areas that are clear become opaque (alpha=255) - to be preserved
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3]; // Current alpha channel
      
      if (alpha > 0) {
        // This pixel was drawn on - make it transparent in the mask (to be edited)
        mask[i] = 0;     // R
        mask[i + 1] = 0; // G
        mask[i + 2] = 0; // B
        mask[i + 3] = 0; // A - transparent (edit this area)
        drawnPixels++;
      } else {
        // This pixel was not drawn on - make it opaque in the mask (preserve this area)
        mask[i] = 0;       // R
        mask[i + 1] = 0;   // G
        mask[i + 2] = 0;   // B
        mask[i + 3] = 255; // A - opaque (preserve this area)
      }
    }
    
    // Create a temporary canvas to render the RGBA mask at original size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalImageSize.width;
    tempCanvas.height = originalImageSize.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;
    
    // Put the converted mask data onto the temporary canvas
    tempCtx.putImageData(maskData, 0, 0);
    
    // Convert to blob
    return new Promise<Blob | null>((resolve) => {
      tempCanvas.toBlob(resolve, 'image/png');
    });
  }, [originalImageSize]);

  const handleSubmit = useCallback(async () => {
    if (!image || !maskCanvasRef.current || !baseRef.current || !isMaskCanvasInitialized) return;
    setSubmitting(true);
    setSubmitMsg('Processing...');
    setSubmitError('');
    setEta(null);
    onProcessingStart?.(); // Notify parent that processing has started
    try {
      // Convert mask to proper RGBA format for OpenAI
      const maskBlob = await convertMaskToRGBA(maskCanvasRef.current);
      
      // Use the original image file, not the scaled canvas version
      // The OpenAI API expects the mask to match the original image dimensions
      const maskFile = maskBlob
        ? new File([maskBlob], 'mask.png', { type: 'image/png' })
        : undefined;
      
      const result = await editImage(image, prompt || 'Edit', maskFile);
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
  }, [image, maskCanvasRef, baseRef, isMaskCanvasInitialized, prompt, onRequestId, onError, convertMaskToRGBA]);

  // Update the ref whenever handleSubmit changes
  useEffect(() => {
    submitHandlerRef.current = handleSubmit;
  }, [handleSubmit]);

  // Expose the submit handler to parent component
  useEffect(() => {
    if (onSubmitReady) {
      const stableSubmitHandler = () => {
        if (submitHandlerRef.current) {
          return submitHandlerRef.current();
        }
        return Promise.resolve();
      };
      onSubmitReady(stableSubmitHandler);
    }
  }, [onSubmitReady]); // Remove handleSubmit from dependencies

  return (
    <div className="border rounded p-4 mt-4">
      {image ? (
        <>
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
              style={{ 
                display: image ? 'block' : 'none',
                position: 'relative',
                zIndex: 1,
                borderRadius: 'calc(var(--border-radius) / 2)'
              }}
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
                  zIndex: 2,
                  // Ensure exact alignment with base canvas
                  margin: 0,
                  padding: 0,
                  border: '1px solid transparent', // Match border without visual impact
                }}
                className="block"
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
