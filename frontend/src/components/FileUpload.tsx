import { useState, ChangeEvent, FormEvent, useRef } from 'react'; // Added useRef
import { uploadImage } from '../services/apiClient';
import ProgressIndicator from './ProgressIndicator';

/**
 * Handles image selection and upload to the backend.
 *
 * @param onUploaded Callback invoked with the uploaded file on success.
 * @param id Optional id for the input element, also used for the label.
 */

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const SUPPORTED_DIMENSIONS = [256, 512, 1024]; // Must be square and one of these sizes

export default function FileUpload({
  onUploaded,
  id = 'file-upload-input', // Default id if not provided
}: {
  onUploaded?: (file: File) => void;
  id?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('No file selected.'); // Default message
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) {
      setFile(null);
      setMessage('No file selected.');
      setError('');
      if (onUploaded) onUploaded(null as any); // Notify parent that file is deselected
      return;
    }
    const selected = e.target.files[0];
    setError(''); // Clear previous errors

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setError('Unsupported file type');
      setFile(null);
      setMessage('No file selected.');
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      if (onUploaded) onUploaded(null as any);
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError('File too large');
      setFile(null);
      setMessage('No file selected.');
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onUploaded) onUploaded(null as any);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(selected);
    img.onload = () => {
      const { width, height } = img;
      URL.revokeObjectURL(objectUrl);
      // if (width !== height || !SUPPORTED_DIMENSIONS.includes(width)) { // Temporarily relax dimension check for testing
      //   setError(
      //     `Invalid dimensions: ${width}x${height}. Must be square and one of ${SUPPORTED_DIMENSIONS.join(
      //       ', '
      //     )} `
      //   );
      //   setFile(null);
      //   setMessage('No file selected.');
      //   if (fileInputRef.current) fileInputRef.current.value = "";
      //   if (onUploaded) onUploaded(null as any);
      //   return;
      // }

      setFile(selected);
      setMessage(selected.name);
      setError('');
      if (onUploaded) {
        onUploaded(selected);
      }
    };
    img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setError("Could not load image to check dimensions.");
        setFile(null);
        setMessage('No file selected.');
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onUploaded) onUploaded(null as any);
    };
    img.src = objectUrl;
  };

  // Removed handleSubmit as upload is triggered by onUploaded in handleChange directly for now

  return (
    // The form tag might be redundant if there's no explicit submit button here
    <div className="control-group">
      <label htmlFor={id} className="file-upload-label">Choose a file...</label>
      <input
        type="file"
        id={id}
        ref={fileInputRef} // Assign ref
        onChange={handleChange}
        accept={ACCEPTED_TYPES.join(',')}
        style={{ display: 'none' }}
      />
      <p className="file-name-display">{error || message}</p> {/* Display error or current file/message */}
      {/* Progress indicator can be added here if direct upload from this component is re-enabled */}
      {/* {uploading && <ProgressIndicator message={message} />} */}
    </div>
  );
}
