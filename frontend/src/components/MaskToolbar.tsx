import React from 'react';

/**
 * Toolbar for selecting the brush size used when drawing the mask.
 */

export type BrushSize = 'small' | 'medium' | 'large';
export type Tool = 'brush' | 'rectangle' | 'circle';

interface Props {
  brushSize: BrushSize;
  setBrushSize: (size: BrushSize) => void;
  tool: Tool;
  setTool: (tool: Tool) => void;
}

export default function MaskToolbar({ brushSize, setBrushSize, tool, setTool }: Props) {
  const options: BrushSize[] = ['small', 'medium', 'large'];
  const toolOptions: Tool[] = ['brush', 'rectangle', 'circle'];
  const label = (s: BrushSize) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="flex items-center gap-4" aria-label="Mask Toolbar">
      <div className="flex items-center gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-1">
            <input
              type="radio"
              aria-label={label(opt)}
              name="brush-size"
              value={opt}
              checked={brushSize === opt}
              onChange={() => setBrushSize(opt)}
              className="focus:outline focus:outline-blue-500"
            />
            {label(opt)}
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {toolOptions.map((t) => (
          <label key={t} className="flex items-center gap-1">
            <input
              type="radio"
              aria-label={t}
              name="draw-tool"
              value={t}
              checked={tool === t}
              onChange={() => setTool(t)}
              className="focus:outline focus:outline-blue-500"
            />
            {t}
          </label>
        ))}
      </div>
    </div>
  );
}
