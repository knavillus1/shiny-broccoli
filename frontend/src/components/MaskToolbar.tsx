import React from 'react';

/**
 * Toolbar for selecting the brush size used when drawing the mask.
 */

export type BrushSize = 'small' | 'medium' | 'large';

interface Props {
  brushSize: BrushSize;
  setBrushSize: (size: BrushSize) => void;
}

export default function MaskToolbar({ brushSize, setBrushSize }: Props) {
  const options: BrushSize[] = ['small', 'medium', 'large'];
  const label = (s: BrushSize) => s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <div className="flex items-center gap-2" aria-label="Mask Toolbar">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-1">
          <input
            type="radio"
            aria-label={label(opt)}
            name="brush-size"
            value={opt}
            checked={brushSize === opt}
            onChange={() => setBrushSize(opt)}
          />
          {label(opt)}
        </label>
      ))}
    </div>
  );
}
