import { useState, useEffect, useCallback } from 'react';
import { fetchEditStatus, downloadResultImage } from '../services/apiClient';
import CanvasDisplay from '../components/CanvasDisplay';
import ErrorBoundary from '../components/ErrorBoundary';
import useCanvas from '../hooks/useCanvas';

// Define props for HomePage
interface HomePageProps {
  image: File | null;
  prompt: string;
  onSubmitReady?: (submitHandler: () => Promise<void>) => void;
  onResult?: (file: File) => void;
  onError?: (errorMsg: string) => void;
  onProcessingStart?: () => void;
}

export default function HomePage({ image, prompt, onSubmitReady, onResult, onError, onProcessingStart }: HomePageProps) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const [maskVisible, setMaskVisible] = useState(true);

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
        if (!cancelled) {
          onError?.('Request timed out after 3 minutes');
          setRequestId(null);
        }
        return;
      }
      
      pollCount++;
      
      try {
        const status = await fetchEditStatus(requestId);
        
        if (status.status === 'completed') {
          
          const resultData = status.result?.data?.[0];
          if (resultData?.url) {
            try {
              const blob = await downloadResultImage(requestId);
              
              const file = new File([blob], 'result.png', { type: 'image/png' });
              if (!cancelled) {
                onResult?.(file);
                setRequestId(null); // Clear request ID after successful completion
              }
            } catch (downloadError) {
              // Fallback to direct fetch
              try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const res = await fetch(resultData.url, {
                  mode: 'cors',
                  credentials: 'omit'
                });
                
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                
                const blob = await res.blob();
                
                const file = new File([blob], 'result.png', { type: 'image/png' });
                if (!cancelled) {
                  onResult?.(file);
                  setRequestId(null);
                }
              } catch (fetchError) {
                if (!cancelled) {
                  onError?.(`Failed to download the generated image: ${fetchError.message}`);
                  setRequestId(null);
                }
              }
            }
          } else if (resultData?.b64_json) {
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
              if (!cancelled) {
                onError?.('Failed to process the generated image data');
                setRequestId(null);
              }
            }
          } else {
            if (!cancelled) {
              onError?.('Image processing completed but no result data found');
              setRequestId(null);
            }
          }
        } else if (status.status === 'error') {
          if (!cancelled) {
            onError?.(status.error || 'Processing failed');
            setRequestId(null); // Clear request ID after error
          }
        } else {
          // Status is still processing, continue polling
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = (err as Error).message;
          // If the request ID is not found (404), clear it and stop polling
          if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
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
      // Clear any previous request ID when new image/prompt is provided
      setRequestId(null);
    }
  }, [image, prompt]);

  return (
    <ErrorBoundary fallback={<p>Something went wrong.</p>}>
      {/* Editor Toolbar - only show when image is loaded */}
      {image && (
        <div id="editor-toolbar-container" className={!image ? 'toolbar-disabled' : ''}>
          <div className="editor-toolbar">
            <div className="toolbar-row">
              <div id="tool-size-group" className="toolbar-group">
                <label>
                  <input
                    type="radio"
                    name="brush-size"
                    value="small"
                    checked={maskBrushSize === 'small'}
                    onChange={() => setMaskBrushSize('small')}
                  />
                  Small
                </label>
                <label>
                  <input
                    type="radio"
                    name="brush-size"
                    value="medium"
                    checked={maskBrushSize === 'medium'}
                    onChange={() => setMaskBrushSize('medium')}
                  />
                  Medium
                </label>
                <label>
                  <input
                    type="radio"
                    name="brush-size"
                    value="large"
                    checked={maskBrushSize === 'large'}
                    onChange={() => setMaskBrushSize('large')}
                  />
                  Large
                </label>
              </div>
              <div className="toolbar-divider"></div>
              <div id="tool-type-group" className="toolbar-group">
                <label>
                  <input
                    type="radio"
                    name="tool-type"
                    value="brush"
                    checked={maskTool === 'brush'}
                    onChange={() => setMaskTool('brush')}
                  />
                  brush
                </label>
                <label>
                  <input
                    type="radio"
                    name="tool-type"
                    value="rectangle"
                    checked={maskTool === 'rectangle'}
                    onChange={() => setMaskTool('rectangle')}
                  />
                  rectangle
                </label>
                <label>
                  <input
                    type="radio"
                    name="tool-type"
                    value="circle"
                    checked={maskTool === 'circle'}
                    onChange={() => setMaskTool('circle')}
                  />
                  circle
                </label>
              </div>
            </div>
            <div className="toolbar-row">
              <div className="toolbar-group">
                <button 
                  id="tool-mode-toggle" 
                  className="toolbar-action-btn"
                  onClick={toggleMaskMode}
                >
                  {maskMode === 'draw' ? 'Switch to Erase' : 'Switch to Draw'}
                </button>
                <button 
                  id="mask-visibility-toggle" 
                  className="toolbar-action-btn"
                  onClick={() => setMaskVisible(!maskVisible)}
                >
                  {maskVisible ? 'Hide Mask' : 'Show Mask'}
                </button>
                <button 
                  id="clear-mask-btn" 
                  className="toolbar-action-btn"
                  onClick={clearMaskCanvas}
                >
                  Clear Mask
                </button>
                <button 
                  id="undo-btn" 
                  className="toolbar-action-btn"
                  disabled={!canUndoMask}
                  onClick={undoMaskCanvas}
                >
                  Undo
                </button>
                <button 
                  id="redo-btn" 
                  className="toolbar-action-btn"
                  disabled={!canRedoMask}
                  onClick={redoMaskCanvas}
                >
                  Redo
                </button>
              </div>
              <div id="status-display">
                Mode: {maskMode === 'draw' ? 'Draw' : 'Erase'} | Tool: {maskTool.charAt(0).toUpperCase() + maskTool.slice(1)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Canvas placeholder when no image */}
      {!image && <p id="canvas-placeholder">Upload an image to get started</p>}
      
      {/* Main Canvas Display */}
      <CanvasDisplay
        image={image}
        prompt={prompt}
        onResult={handleCanvasResult}
        onError={onError}
        onRequestId={handleRequestId}
        onSubmitReady={onSubmitReady}
        onProcessingStart={onProcessingStart}
        
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
        maskVisible={maskVisible}
        toggleMaskVisibility={() => setMaskVisible(!maskVisible)}
      />
    </ErrorBoundary>
  );
}
