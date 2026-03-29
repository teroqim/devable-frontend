import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectCard from './ProjectCard';
import type { ApiProject } from '@/types/api';

const mockProject: ApiProject = {
  id: '1',
  name: 'Test Project',
  slug: 'test-project',
  userId: 'user_123',
  status: 'created',
  previewUrl: 'test-project.localhost:8080',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('ProjectCard', () => {
  it('should render project name and preview URL', () => {
    render(
      <ProjectCard project={mockProject} onStart={vi.fn()} onStop={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Test Project')).toBeDefined();
    expect(screen.getByText('test-project.localhost:8080')).toBeDefined();
  });

  it('should show Start button when project is not running', () => {
    render(
      <ProjectCard project={mockProject} onStart={vi.fn()} onStop={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Start')).toBeDefined();
  });

  it('should show Stop button when project is running', () => {
    const runningProject = { ...mockProject, status: 'running' as const };
    render(
      <ProjectCard project={runningProject} onStart={vi.fn()} onStop={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Stop')).toBeDefined();
  });

  it('should call onStart when Start is clicked', () => {
    const handleStart = vi.fn();
    render(
      <ProjectCard project={mockProject} onStart={handleStart} onStop={vi.fn()} onDelete={vi.fn()} />,
    );

    fireEvent.click(screen.getByText('Start'));
    expect(handleStart).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(
      <ProjectCard project={mockProject} onStart={vi.fn()} onStop={vi.fn()} onDelete={handleDelete} />,
    );

    // Delete button only has the trash icon, find it by role
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[buttons.length - 1];
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it('should show status badge', () => {
    render(
      <ProjectCard project={mockProject} onStart={vi.fn()} onStop={vi.fn()} onDelete={vi.fn()} />,
    );

    expect(screen.getByText('Created')).toBeDefined();
  });
});
