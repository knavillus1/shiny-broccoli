import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry } from './apiClient';

const responseData = { status: 'ok' };

describe('fetchWithRetry', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllTimers();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('retries failed requests and eventually succeeds', async () => {
    const mockFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue(
        new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    global.fetch = mockFetch as unknown as typeof fetch;
    const result = await (await fetchWithRetry('url', {}, 2, 0)).json();
    expect(result).toEqual(responseData);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting retries', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('fail'));
    global.fetch = mockFetch as unknown as typeof fetch;
    await expect(fetchWithRetry('url', {}, 2, 0)).rejects.toThrow('fail');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
