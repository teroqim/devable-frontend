import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteProjectDialog from './DeleteProjectDialog';

describe('DeleteProjectDialog', () => {
  it('should not render when open is false', () => {
    const { container } = render(
      <DeleteProjectDialog open={false} projectName="Test" onClose={vi.fn()} onConfirm={vi.fn()} loading={false} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should show project name in confirmation message', () => {
    render(
      <DeleteProjectDialog open={true} projectName="My Project" onClose={vi.fn()} onConfirm={vi.fn()} loading={false} />,
    );

    expect(screen.getByText('My Project')).toBeDefined();
  });

  it('should call onConfirm when Delete is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <DeleteProjectDialog open={true} projectName="Test" onClose={vi.fn()} onConfirm={handleConfirm} loading={false} />,
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(handleConfirm).toHaveBeenCalled();
  });

  it('should call onClose when Cancel is clicked', () => {
    const handleClose = vi.fn();
    render(
      <DeleteProjectDialog open={true} projectName="Test" onClose={handleClose} onConfirm={vi.fn()} loading={false} />,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should show Deleting... when loading', () => {
    render(
      <DeleteProjectDialog open={true} projectName="Test" onClose={vi.fn()} onConfirm={vi.fn()} loading={true} />,
    );

    expect(screen.getByText('Deleting...')).toBeDefined();
  });
});
