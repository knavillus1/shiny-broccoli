import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import CanvasDisplay from './CanvasDisplay';

vi.stubGlobal('Image', class {
  onload: (() => void) | null = null;
  width = 100;
  height = 100;
  set src(_val: string) {
    this.onload && this.onload();
  }
});

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  drawImage: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
} as unknown as CanvasRenderingContext2D));

HTMLCanvasElement.prototype.toBlob = vi.fn(function (cb) {
  cb?.(new Blob());
});

vi.mock('../services/apiClient', () => ({
  processImage: vi.fn(() => Promise.resolve({ detail: 'ok' })),
}));

global.URL.createObjectURL = vi.fn(() => 'blob:url');
global.URL.revokeObjectURL = vi.fn();

describe('CanvasDisplay', () => {
  it('toggles mask visibility and submits', async () => {
    const file = new File(['data'], 'test.png', { type: 'image/png' });
    const { getByText } = render(<CanvasDisplay image={file} />);
    await waitFor(() => getByText('Switch to Erase'));
    const toggle = getByText('Hide Mask');
    fireEvent.click(toggle);
    expect(toggle.textContent).toBe('Show Mask');
    fireEvent.click(getByText('Submit'));
    await waitFor(() => getByText('ok'));
  });
});
