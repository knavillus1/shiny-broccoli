import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import MaskToolbar from './MaskToolbar';

describe('MaskToolbar', () => {
  it('changes brush size', () => {
    const setSize = vi.fn();
    const { getByLabelText } = render(
      <MaskToolbar brushSize="medium" setBrushSize={setSize} />
    );
    const large = getByLabelText('Large');
    fireEvent.click(large);
    expect(setSize).toHaveBeenCalledWith('large');
  });
});
