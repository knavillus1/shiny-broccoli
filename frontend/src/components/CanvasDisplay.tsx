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
  const submitHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const originalImageRef = useRef<{ width: number; height: number; scale: number } | null>(null);
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
      
      // Store original image dimensions and scale for mask conversion
      originalImageRef.current = {
        width: img.width,
        height: img.height,
        scale: scale
      };
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      console.log(`Canvas resized to: ${canvas.width}x${canvas.height}, scale: ${scale}, original: ${img.width}x${img.height}`);
      
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
            console.log("Could not preserve existing mask data:", e);
          }
        }
        
        // Ensure mask canvas has the same dimensions as the base canvas
        maskCanvasRef.current.width = canvas.width;
        maskCanvasRef.current.height = canvas.height;
        
        console.log(`Mask canvas resized from ${oldWidth}x${oldHeight} to ${canvas.width}x${canvas.height}`);
        
        // If we have existing mask data and the canvas size hasn't changed, restore it
        if (existingMaskData && oldWidth === canvas.width && oldHeight === canvas.height && maskCtx) {
          try {
            maskCtx.putImageData(existingMaskData, 0, 0);
            console.log("Restored existing mask data after canvas update");
          } catch (e) {
            console.log("Failed to restore mask data:", e);
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
      console.error("Failed to load image:", image.name);
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
    console.log(`Coords: click(${event.clientX},${event.clientY}) -> canvas(${coords.x},${coords.y}), rect: ${rect.left},${rect.top}`);
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

  // Helper function to debug mask data
  const debugMask = useCallback(async (maskBlob: Blob) => {
    console.log('=== MASK DEBUG INFO ===');
    console.log('Mask blob size:', maskBlob.size, 'bytes');
    console.log('Mask blob type:', maskBlob.type);
    
    // Create a debug canvas to visualize the mask
    const debugCanvas = document.createElement('canvas');
    const img = new Image();
    const url = URL.createObjectURL(maskBlob);
    
    return new Promise<void>((resolve) => {
      img.onload = () => {
        debugCanvas.width = img.width;
        debugCanvas.height = img.height;
        const ctx = debugCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const data = imageData.data;
          
          let transparentPixels = 0;
          let opaquePixels = 0;
          let semiTransparentPixels = 0;
          
          for (let i = 3; i < data.length; i += 4) {
            const alpha = data[i];
            if (alpha === 0) transparentPixels++;
            else if (alpha === 255) opaquePixels++;
            else semiTransparentPixels++;
          }
          
          console.log('Mask analysis:');
          console.log('- Transparent pixels (edit areas):', transparentPixels);
          console.log('- Opaque pixels (preserve areas):', opaquePixels);
          console.log('- Semi-transparent pixels:', semiTransparentPixels);
          console.log('- Total pixels:', data.length / 4);
          console.log('- Edit area ratio:', (transparentPixels / (data.length / 4) * 100).toFixed(2) + '%');
        }
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  }, []);

  // Convert mask canvas to proper RGBA format for OpenAI, scaled to original image dimensions
  const convertMaskToRGBA = useCallback(async (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !originalImageRef.current) return null;
    
    const { width: originalWidth, height: originalHeight, scale } = originalImageRef.current;
    
    console.log(`Converting mask canvas ${canvas.width}x${canvas.height} to RGBA format`);
    console.log(`Scaling mask from display size to original image size: ${originalWidth}x${originalHeight}`);
    
    // Create a canvas at the original image dimensions
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = originalWidth;
    scaledCanvas.height = originalHeight;
    const scaledCtx = scaledCanvas.getContext('2d');
    if (!scaledCtx) return null;
    
    // Scale the mask to the original image dimensions
    // We need to scale up the mask by 1/scale factor
    const scaleUpFactor = 1 / scale;
    scaledCtx.scale(scaleUpFactor, scaleUpFactor);
    scaledCtx.drawImage(canvas, 0, 0);
    
    // Now get the image data from the scaled canvas
    const imageData = scaledCtx.getImageData(0, 0, originalWidth, originalHeight);
    const data = imageData.data;
    
    // Create a new ImageData for the RGBA mask
    const maskData = new ImageData(originalWidth, originalHeight);
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
    
    console.log(`Mask conversion: ${drawnPixels} drawn pixels out of ${data.length / 4} total pixels at ${originalWidth}x${originalHeight}`);
    
    // Create a temporary canvas to render the RGBA mask at original dimensions
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;
    
    // Put the converted mask data onto the temporary canvas
    tempCtx.putImageData(maskData, 0, 0);
    
    // Convert to blob
    return new Promise<Blob | null>((resolve) => {
      tempCanvas.toBlob(resolve, 'image/png');
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!image || !maskCanvasRef.current || !baseRef.current || !isMaskCanvasInitialized) return;
    setSubmitting(true);
    setSubmitMsg('Processing...');
    setSubmitError('');
    setEta(null);
    try {
      // Convert mask to proper RGBA format for OpenAI
      console.log('Converting mask to RGBA format...');
      const maskBlob = await convertMaskToRGBA(maskCanvasRef.current);
      
      // Debug the mask before sending
      if (maskBlob) {
        await debugMask(maskBlob);
      }
      
      // Debug mask data before sending
      await debugMask(maskBlob!);
      
      // Use the original image file, not the scaled canvas version
      // The OpenAI API expects the mask to match the original image dimensions
      const maskFile = maskBlob
        ? new File([maskBlob], 'mask.png', { type: 'image/png' })
        : undefined;
      
      console.log('Submitting to OpenAI with:', {
        originalImageSize: image.size,
        maskSize: maskFile?.size,
        hasMask: !!maskFile,
        originalImageDimensions: originalImageRef.current ? `${originalImageRef.current.width}x${originalImageRef.current.height}` : 'unknown'
      });
      
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
  }, [image, maskCanvasRef, baseRef, isMaskCanvasInitialized, prompt, onRequestId, onError, convertMaskToRGBA, debugMask]);

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
              style={{ 
                display: image ? 'block' : 'none',
                position: 'relative',
                zIndex: 1
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
