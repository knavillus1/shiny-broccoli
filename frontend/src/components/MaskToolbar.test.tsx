import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import MaskToolbar from './MaskToolbar';

describe('MaskToolbar', () => {
  it('changes brush size', () => {
    const setSize = vi.fn();
    const { getByLabelText } = render(
      <MaskToolbar brushSize="medium" setBrushSize={setSize} tool="brush" setTool={vi.fn()} />
    );
    const large = getByLabelText('Large');
    fireEvent.click(large);
    expect(setSize).toHaveBeenCalledWith('large');
  });

  it('changes drawing tool', () => {
    const setTool = vi.fn();
    const { getAllByLabelText } = render(
      <MaskToolbar brushSize="medium" setBrushSize={vi.fn()} tool="brush" setTool={setTool} />
    );
    const rects = getAllByLabelText('rectangle');
    const rect = rects[rects.length - 1];
    fireEvent.click(rect);
    expect(setTool).toHaveBeenCalledWith('rectangle');
  });
});
