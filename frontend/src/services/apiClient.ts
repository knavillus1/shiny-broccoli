export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function parseError(response: Response): Promise<string> {
  let detail = '';
  try {
    const data = await response.json();
    detail = (data as any).detail || '';
  } catch {
    // ignore
  }
  switch (response.status) {
    case 400:
      return detail || 'Bad request';
    case 401:
      return detail || 'Unauthorized. Check API key.';
    case 404:
      return detail || 'Resource not found';
    case 429:
      return 'Too many requests. Please try again later.';
    case 502:
    case 503:
      return 'Server unavailable. Please try again later.';
    case 504:
      return 'Server timeout. Please retry.';
    default:
      return detail || response.statusText || 'Request failed';
  }
}

export async function fetchWithRetry(
  input: RequestInfo,
  init?: RequestInit,
  retries = 2,
  backoff = 300,
) {
  try {
    const res = await fetch(input, init);
    if (!res.ok && res.status >= 500 && retries > 0) {
      await new Promise((r) => setTimeout(r, backoff));
      return fetchWithRetry(input, init, retries - 1, backoff * 2);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, backoff));
      return fetchWithRetry(input, init, retries - 1, backoff * 2);
    }
    throw err;
  }
}

export async function fetchHealth() {
  const response = await fetchWithRetry(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function uploadImage(file: File) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetchWithRetry(`${API_BASE_URL}/images/upload`, {
    method: 'POST',
    body,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function processImage(file: File, mask?: File) {
  const body = new FormData();
  body.append('file', file);
  if (mask) body.append('mask', mask);
  const response = await fetchWithRetry(`${API_BASE_URL}/images/process`, {
    method: 'POST',
    body,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
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
  const response = await fetchWithRetry(`${API_BASE_URL}/images/edit`, {
    method: 'POST',
    body,
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function fetchEditStatus(requestId: string) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/images/status/${requestId}`,
  );
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function downloadResultImage(requestId: string) {
  const response = await fetchWithRetry(
    `${API_BASE_URL}/images/download/${requestId}`,
  );
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.blob();
}
