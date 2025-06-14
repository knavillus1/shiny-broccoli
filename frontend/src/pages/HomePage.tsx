import { useState, useEffect, useCallback } from 'react';
import { fetchEditStatus } from '../services/apiClient';
import CanvasDisplay from '../components/CanvasDisplay';
import ResultsDisplay from '../components/ResultsDisplay';
import ErrorBoundary from '../components/ErrorBoundary';
import MaskToolbar from '../components/MaskToolbar';
import useCanvas from '../hooks/useCanvas';

// Define props for HomePage
interface HomePageProps {
  image: File | null;
  prompt: string;
  onSubmitReady?: (submitHandler: () => Promise<void>) => void;
}

export default function HomePage({ image, prompt, onSubmitReady }: HomePageProps) {
  const [result, setResult] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState<string | null>(null);

  const {
    canvasRef: maskCanvasRefForDisplay, // This is the ref object for the mask canvas
    initializeCanvasWithSize,
    isInitialized: isMaskCanvasInitialized,
    mode: maskMode,
    toggleMode: toggleMaskMode,
    clear: clearMaskCanvas,
    undo: undoMaskCanvas,
    redo: redoMaskCanvas,
    canUndo: canUndoMask,
    canRedo: canRedoMask,
    brushSize: maskBrushSize,
    setBrushSize: setMaskBrushSize,
    tool: maskTool,
    setTool: setMaskTool,
    drawBrushStroke,
    drawShape,
    saveState: saveMaskState,
    setStartPosition: setMaskStartPosition,
    getStartPosition: getMaskStartPosition,
  } = useCanvas();

  const handleMaskCanvasReady = useCallback((width: number, height: number) => {
    if (initializeCanvasWithSize) {
      initializeCanvasWithSize(width, height);
    }
  }, [initializeCanvasWithSize]);

  const handleCanvasResult = (file: File) => {
    void file; // preview ignored until processing completes
  };

  // Clear any stale request ID on component mount
  useEffect(() => {
    setRequestId(null);
    setResult(null);
    setError('');
  }, []);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    let pollCount = 0;
    const maxPolls = 60; // Maximum 3 minutes of polling (60 * 3 seconds)
    
    const poll = async () => {
      if (pollCount >= maxPolls) {
        console.log('Polling timeout reached');
        if (!cancelled) {
          setError('Request timed out after 3 minutes');
          setRequestId(null);
        }
        return;
      }
      
      pollCount++;
      
      try {
        const status = await fetchEditStatus(requestId);
        console.log(`Polling status response (attempt ${pollCount}/${maxPolls}):`, status);
        
        if (status.status === 'completed') {
          console.log('Status is completed, checking result structure...');
          console.log('Result:', status.result);
          
          if (status.result?.data?.[0]?.url) {
            console.log('Found URL:', status.result.data[0].url);
            const res = await fetch(status.result.data[0].url);
            const blob = await res.blob();
            const file = new File([blob], 'result.png', { type: 'image/png' });
            if (!cancelled) {
              setResult(file);
              setError('');
              setRequestId(null); // Clear request ID after successful completion
            }
          } else {
            console.error('Completed but no URL found in result:', status.result);
            if (!cancelled) {
              setError('Image processing completed but no result URL found');
              setRequestId(null);
            }
          }
        } else if (status.status === 'error') {
          console.log('Status is error:', status.error);
          if (!cancelled) {
            setError(status.error || 'Processing failed');
            setRequestId(null); // Clear request ID after error
          }
        } else {
          console.log(`Status is ${status.status}, continuing to poll... (${pollCount}/${maxPolls})`);
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = (err as Error).message;
          // If the request ID is not found (404), clear it and stop polling
          if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
            console.log('Request ID not found, clearing polling');
            setRequestId(null);
            setError('');
          } else {
            setError(errorMessage);
          }
        }
      }
    };
    const interval = setInterval(poll, 3000);
    void poll(); // Initial call
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [requestId]);

  useEffect(() => {
    if (image && prompt) {
      console.log("HomePage received image and prompt, ready to generate if requested.");
      // Clear any previous request ID when new image/prompt is provided
      setRequestId(null);
      setResult(null);
      setError('');
    }
  }, [image, prompt]);

  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      {image && (
        <MaskToolbar
          brushSize={maskBrushSize}
          setBrushSize={setMaskBrushSize}
          tool={maskTool}
          setTool={setMaskTool}
        />
      )}
      {!image && <p id="canvas-placeholder">Upload an image to get started</p>}
      <CanvasDisplay
        image={image}
        prompt={prompt}
        onResult={handleCanvasResult}
        onError={setError}
        onRequestId={setRequestId}
        onSubmitReady={onSubmitReady}
        
        // Pass the ref object itself, not its .current property
        maskCanvasRef={maskCanvasRefForDisplay} 
        onMaskCanvasReady={handleMaskCanvasReady}
        isMaskCanvasInitialized={isMaskCanvasInitialized}
        drawBrushStroke={drawBrushStroke}
        drawShape={drawShape}
        saveMaskState={saveMaskState}
        maskTool={maskTool}
        maskBrushSize={maskBrushSize}
        maskMode={maskMode}
        setMaskStartPosition={setMaskStartPosition}
        getMaskStartPosition={getMaskStartPosition}
        // Controls for the mask canvas itself, managed by HomePage via useCanvas
        toggleMaskMode={toggleMaskMode}
        clearMask={clearMaskCanvas}
        undoMask={undoMaskCanvas}
        redoMask={redoMaskCanvas}
        canUndoMask={canUndoMask}
        canRedoMask={canRedoMask}
      />
      {image && result && (
        <ResultsDisplay
          original={image}
          result={result}
          error={error || undefined}
        />
      )}
      {error && <p className="error-message">{error}</p>}
    </ErrorBoundary>
  );
}
