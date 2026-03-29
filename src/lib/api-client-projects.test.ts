import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProjects, createProject, deleteProject, startProject, stopProject, ApiError } from './api-client';

const mockGetToken = vi.fn();

const mockProject = {
  id: '1',
  name: 'Test Project',
  slug: 'test-project',
  userId: 'user_123',
  status: 'created',
  previewUrl: 'test-project.localhost:8080',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockGetToken.mockResolvedValue('test-token');
});

describe('fetchProjects', () => {
  it('should return projects on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockProject]),
    });

    const result = await fetchProjects(mockGetToken);
    expect(result).toEqual([mockProject]);
  });

  it('should throw ApiError on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(fetchProjects(mockGetToken)).rejects.toThrow(ApiError);
  });
});

describe('createProject', () => {
  it('should send POST with body and return created project', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProject),
    });

    const result = await createProject({ name: 'Test Project' }, mockGetToken);
    expect(result).toEqual(mockProject);
    expect(global.fetch).toHaveBeenCalledWith('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ name: 'Test Project' }),
    });
  });
});

describe('deleteProject', () => {
  it('should send DELETE request', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    await deleteProject('1', mockGetToken);
    expect(global.fetch).toHaveBeenCalledWith('/api/projects/1', expect.objectContaining({ method: 'DELETE' }));
  });
});

describe('startProject', () => {
  it('should send POST to start endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'started' }),
    });

    await startProject('1', mockGetToken);
    expect(global.fetch).toHaveBeenCalledWith('/api/projects/1/start', expect.objectContaining({ method: 'POST' }));
  });
});

describe('stopProject', () => {
  it('should send POST to stop endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'stopped' }),
    });

    await stopProject('1', mockGetToken);
    expect(global.fetch).toHaveBeenCalledWith('/api/projects/1/stop', expect.objectContaining({ method: 'POST' }));
  });
});
