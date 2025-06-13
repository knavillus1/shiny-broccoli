import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from './FileUpload';

vi.mock('../services/apiClient', () => ({
  uploadImage: vi.fn(() => Promise.resolve({ filename: 'test.png' })),
}));

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
});
