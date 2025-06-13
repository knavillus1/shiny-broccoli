import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from './FileUpload';

vi.mock('../services/apiClient', () => ({
  uploadImage: vi.fn(() => Promise.resolve({ filename: 'test.png' })),
}));

// Mock Image, URL API to simulate 256x256 dimensions and blob URLs
const RealImage = Image;
const RealURL = URL;
beforeAll(() => {
  class MockImage {
    onload: () => void = () => {};
    onerror: () => void = () => {};
    width = 256;
    height = 256;
    set src(_val: string) { this.onload(); }
  }
  // @ts-ignore
  global.Image = MockImage;
  // Mock URL.createObjectURL and revokeObjectURL
  // @ts-ignore
  global.URL = {
    ...RealURL,
    createObjectURL: vi.fn(() => 'blob:mock'),
    revokeObjectURL: vi.fn(),
  };
});
afterAll(() => {
  // @ts-ignore
  global.Image = RealImage;
  // @ts-ignore
  global.URL = RealURL;
});

describe('FileUpload', () => {
  it('uploads valid file', async () => {
    const onUploaded = vi.fn();
    const { getByText, getByLabelText } = render(<FileUpload onUploaded={onUploaded} />);
    const input = getByLabelText('Image:');
    const file = new File(['data'], 'test.png', { type: 'image/png' });
    await fireEvent.change(input, { target: { files: [file] } });
    await fireEvent.submit(getByText('Upload').closest('form') as HTMLFormElement);
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith(file));
    expect(getByText('Upload successful')).toBeTruthy();
  });

  it('rejects unsupported file type', async () => {
    const { getByLabelText, getByText } = render(<FileUpload />);
    const input = getByLabelText('Image:');
    const file = new File(['data'], 'test.bmp', { type: 'image/bmp' });
    await fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(getByText('Error: Unsupported file type')).toBeTruthy();
    });
  });

  it('rejects images with invalid dimensions', async () => {
    class InvalidImage {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      width = 300;
      height = 200;
      set src(_val: string) { this.onload(); }
    }
    // @ts-ignore
    global.Image = InvalidImage;

    const { getByLabelText, getByText } = render(<FileUpload />);
    const input = getByLabelText('Image:');
    const file = new File(['data'], 'bad.png', { type: 'image/png' });
    await fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(getByText(/Invalid dimensions/)).toBeTruthy();
    });
    // Restore default
    // @ts-ignore
    global.Image = RealImage;
  });
});
