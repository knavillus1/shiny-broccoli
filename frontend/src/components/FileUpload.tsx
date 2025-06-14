import { useState, ChangeEvent, FormEvent } from 'react';
import { uploadImage } from '../services/apiClient';
import ProgressIndicator from './ProgressIndicator';

/**
 * Handles image selection and upload to the backend.
 *
 * @param onUploaded Callback invoked with the uploaded file on success.
 */

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const SUPPORTED_DIMENSIONS = [256, 512, 1024]; // Must be square and one of these sizes

export default function FileUpload({ onUploaded }: { onUploaded?: (file: File) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const selected = e.target.files[0];
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Unsupported file type');
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError('File too large');
      setFile(null);
      return;
    }
    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(selected);
    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(objectUrl);
      if (width !== height || !SUPPORTED_DIMENSIONS.includes(width)) {
        setError(
          `Invalid dimensions: ${width}x${height}. Must be square and one of ${SUPPORTED_DIMENSIONS.join(
            ', '
          )} `
        );
        setFile(null);
      } else {
        setError('');
        setFile(selected);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('Cannot validate image dimensions');
      setFile(null);
    };
    img.src = objectUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage('Uploading...');
    try {
      await uploadImage(file);
      setMessage('Upload successful');
      onUploaded?.(file);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded">
      <label htmlFor="file-input" className="mr-2">Image:</label>
      <input
        id="file-input"
        aria-label="Image file"
        className="focus:outline focus:outline-blue-500"
        type="file"
        onChange={handleChange}
        accept={ACCEPTED_TYPES.join(',')}
      />
      <button
        type="submit"
        aria-label="Upload image"
        disabled={!file || uploading}
        className="ml-2 px-2 py-1 border rounded focus:outline focus:outline-blue-500"
      >
        Upload
      </button>
      {uploading && <ProgressIndicator message="Uploading..." />}
      {message && <div className="mt-2 text-green-600">{message}</div>}
      {error && <div className="mt-2 text-red-600">Error: {error}</div>}
    </form>
  );
}
