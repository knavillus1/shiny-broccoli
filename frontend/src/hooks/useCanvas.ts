import { useRef, useState, useCallback } from 'react';

export type BrushSize = 'small' | 'medium' | 'large';
export type Tool = 'brush' | 'rectangle' | 'circle';

export const MAX_HISTORY = 10;

const brushSizeMap: Record<BrushSize, number> = { small: 5, medium: 10, large: 20 };

export default function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [currentBrushSize, setCurrentBrushSize] = useState<BrushSize>('medium');
  const [currentTool, setCurrentTool] = useState<Tool>('brush');

  const history = useRef<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const initializeCanvasWithSize = useCallback((width: number, height: number) => {
    if (!canvasRef.current) {
      setIsInitialized(false);
      return;
    }
    const canvas = canvasRef.current;
    
    // Don't reinitialize if already initialized with the same size
    if (isInitialized && canvas.width === width && canvas.height === height) {
      return;
    }
    
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsInitialized(false);
      return;
    }

    // Only clear and reset history if this is a new initialization or size change
    if (!isInitialized || canvas.width !== width || canvas.height !== height) {
      ctx.clearRect(0, 0, width, height);
      try {
        const initialImageData = ctx.getImageData(0, 0, width, height);
        history.current = [initialImageData];
        setHistoryIndex(0);
        setIsInitialized(true);
      } catch (e) {
        setIsInitialized(false);
      }
    }
  }, [isInitialized]);

  const getContext = useCallback(() => {
    if (!isInitialized || !canvasRef.current) return null;
    return canvasRef.current.getContext('2d');
  }, [isInitialized]);

  const saveState = useCallback(() => {
    if (!isInitialized || !canvasRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    try {
      const currentImageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      const newHistory = history.current.slice(0, historyIndex + 1);
      newHistory.push(currentImageData);
      
      // Limit history to MAX_HISTORY
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift(); // Remove oldest entry
        setHistoryIndex(Math.max(0, newHistory.length - 1));
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      
      history.current = newHistory;
    } catch (e) {
      // Failed to save canvas state
    }
  }, [isInitialized, getContext, historyIndex]);

  const clear = useCallback(() => {
    if (!isInitialized || !canvasRef.current) return;
    const ctx = getContext();
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  }, [isInitialized, getContext, saveState]);

  const undo = useCallback(() => {
    if (!isInitialized || historyIndex <= 0) return;
    const ctx = getContext();
    if (!ctx) return;
    const prevState = history.current[historyIndex - 1];
    if (!prevState) return;
    try {
      ctx.putImageData(prevState, 0, 0);
      setHistoryIndex(prevIndex => prevIndex - 1);
    } catch (e) {
      // Failed to undo
    }
  }, [isInitialized, getContext, historyIndex]);

  const redo = useCallback(() => {
    if (!isInitialized || historyIndex >= history.current.length - 1) return;
    const ctx = getContext();
    if (!ctx) return;
    const nextState = history.current[historyIndex + 1];
    if (!nextState) return;
    try {
      ctx.putImageData(nextState, 0, 0);
      setHistoryIndex(prevIndex => prevIndex + 1);
    } catch (e) {
      // Failed to redo
    }
  }, [isInitialized, getContext, historyIndex]);

  const drawBrushStroke = useCallback((x: number, y: number, isStartingPath: boolean) => {
    if (!isInitialized) return;
    const ctx = getContext();
    if (!ctx) return;

    ctx.lineWidth = brushSizeMap[currentBrushSize];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (mode === 'draw') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'; 
    } else { // mode === 'erase'
      ctx.globalCompositeOperation = 'destination-out'; 
      ctx.strokeStyle = 'rgba(0,0,0,1)'; 
    }

    if (isStartingPath) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }, [isInitialized, getContext, currentBrushSize, mode]);

  const drawShape = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    if (!isInitialized) return;
    const ctx = getContext();
    if (!ctx) return;
    
    ctx.lineWidth = brushSizeMap[currentBrushSize];

    if (mode === 'draw') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.globalCompositeOperation = 'source-over';
    } else { // mode === 'erase'
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.globalCompositeOperation = 'destination-out';
    }
    
    ctx.beginPath();
    if (currentTool === 'rectangle') {
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
    } else if (currentTool === 'circle') {
      const radiusX = Math.abs(x2 - x1) / 2;
      const radiusY = Math.abs(y2 - y1) / 2;
      const centerX = Math.min(x1,x2) + radiusX;
      const centerY = Math.min(y1,y2) + radiusY;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    }
    ctx.fill();
  }, [isInitialized, getContext, currentBrushSize, mode, currentTool]);

  const toggleInternalMode = () => setMode(m => m === 'draw' ? 'erase' : 'draw');

  return {
    canvasRef,
    initializeCanvasWithSize,
    isInitialized,
    saveState,
    clear,
    undo,
    redo,
    canUndo: isInitialized && historyIndex > 0,
    canRedo: isInitialized && historyIndex < history.current.length - 1,
    
    mode,
    toggleMode: toggleInternalMode,
    brushSize: currentBrushSize,
    setBrushSize: setCurrentBrushSize,
    tool: currentTool,
    setTool: setCurrentTool,

    drawBrushStroke,
    drawShape,
    setStartPosition: (pos: { x: number; y: number } | null) => startPos.current = pos,
    getStartPosition: () => startPos.current,
  };
}
