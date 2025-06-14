import { useState, useEffect, useCallback } from 'react';
import { fetchEditStatus, downloadResultImage } from '../services/apiClient';
import CanvasDisplay from '../components/CanvasDisplay';
import ErrorBoundary from '../components/ErrorBoundary';
import MaskToolbar from '../components/MaskToolbar';
import useCanvas from '../hooks/useCanvas';

// Define props for HomePage
interface HomePageProps {
  image: File | null;
  prompt: string;
  onSubmitReady?: (submitHandler: () => Promise<void>) => void;
  onResult?: (file: File) => void;
  onError?: (errorMsg: string) => void;
}

export default function HomePage({ image, prompt, onSubmitReady, onResult, onError }: HomePageProps) {
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

  const handleRequestId = useCallback((id: string) => {
    setRequestId(id);
  }, []);

  // Clear any stale request ID on component mount
  useEffect(() => {
    setRequestId(null);
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
          onError?.('Request timed out after 3 minutes');
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
          
          const resultData = status.result?.data?.[0];
          if (resultData?.url) {
            console.log('Found URL, downloading via backend proxy...');
            try {
              const blob = await downloadResultImage(requestId);
              console.log('Successfully downloaded image via proxy, blob size:', blob.size);
              
              const file = new File([blob], 'result.png', { type: 'image/png' });
              if (!cancelled) {
                onResult?.(file);
                setRequestId(null); // Clear request ID after successful completion
              }
            } catch (downloadError) {
              console.error('Failed to download via proxy, trying direct fetch...', downloadError);
              
              // Fallback to direct fetch
              try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('Fetching image directly from URL...');
                const res = await fetch(resultData.url, {
                  mode: 'cors',
                  credentials: 'omit'
                });
                
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                
                console.log('Successfully fetched image directly, creating blob...');
                const blob = await res.blob();
                console.log('Blob created, size:', blob.size);
                
                const file = new File([blob], 'result.png', { type: 'image/png' });
                if (!cancelled) {
                  onResult?.(file);
                  setRequestId(null);
                }
              } catch (fetchError) {
                console.error('Direct fetch also failed:', fetchError);
                console.error('Error details:', {
                  message: fetchError.message,
                  stack: fetchError.stack,
                  url: resultData.url
                });
                if (!cancelled) {
                  onError?.(`Failed to download the generated image: ${fetchError.message}`);
                  setRequestId(null);
                }
              }
            }
          } else if (resultData?.b64_json) {
            console.log('Found base64 data, converting to file...');
            try {
              const binaryString = atob(resultData.b64_json);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: 'image/png' });
              const file = new File([blob], 'result.png', { type: 'image/png' });
              if (!cancelled) {
                onResult?.(file);
                setRequestId(null);
              }
            } catch (b64Error) {
              console.error('Failed to process base64 image:', b64Error);
              if (!cancelled) {
                onError?.('Failed to process the generated image data');
                setRequestId(null);
              }
            }
          } else {
            console.error('Completed but no URL or base64 data found in result:', status.result);
            if (!cancelled) {
              onError?.('Image processing completed but no result data found');
              setRequestId(null);
            }
          }
        } else if (status.status === 'error') {
          console.log('Status is error:', status.error);
          if (!cancelled) {
            onError?.(status.error || 'Processing failed');
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
          } else {
            onError?.(errorMessage);
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
        onError={onError}
        onRequestId={handleRequestId}
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
    </ErrorBoundary>
  );
}
