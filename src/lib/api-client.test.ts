import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAnnouncements, ApiError } from './api-client';

const mockGetToken = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  mockGetToken.mockResolvedValue('test-token');
});

describe('fetchAnnouncements', () => {
  it('should return announcements on success', async () => {
    const mockData = [
      {
        id: '1',
        title: 'Test',
        content: 'Content',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchAnnouncements(mockGetToken);
    expect(result).toEqual(mockData);
  });

  it('should include bearer token in request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await fetchAnnouncements(mockGetToken);

    expect(global.fetch).toHaveBeenCalledWith('/api/announcements', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: undefined,
    });
  });

  it('should throw ApiError on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    await expect(fetchAnnouncements(mockGetToken)).rejects.toThrow(ApiError);
  });
});
