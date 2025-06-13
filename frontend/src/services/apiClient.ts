export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function fetchHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function uploadImage(file: File) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_BASE_URL}/images/upload`, {
    method: 'POST',
    body,
  });
  if (!response.ok) {
    throw new Error('Image upload failed');
  }
  return response.json();
}

export async function processImage(file: File, mask?: File) {
  const body = new FormData();
  body.append('file', file);
  if (mask) body.append('mask', mask);
  const response = await fetch(`${API_BASE_URL}/images/process`, {
    method: 'POST',
    body,
  });
  if (!response.ok) {
    throw new Error('Image processing failed');
  }
  return response.json();
}

export async function editImage(
  image: File,
  prompt: string,
  mask?: File,
) {
  const body = new FormData();
  body.append('image', image);
  body.append('prompt', prompt);
  if (mask) body.append('mask', mask);
  const response = await fetch(`${API_BASE_URL}/images/edit`, {
    method: 'POST',
    body,
  });
  if (!response.ok) {
    throw new Error('OpenAI image edit failed');
  }
  return response.json();
}

export async function fetchEditStatus(requestId: string) {
  const response = await fetch(`${API_BASE_URL}/images/status/${requestId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch status');
  }
  return response.json();
}
