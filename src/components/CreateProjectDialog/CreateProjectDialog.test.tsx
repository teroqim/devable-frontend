import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateProjectDialog from './CreateProjectDialog';

describe('CreateProjectDialog', () => {
  it('should not render when open is false', () => {
    const { container } = render(
      <CreateProjectDialog open={false} onClose={vi.fn()} onCreate={vi.fn()} loading={false} />,
    );

    expect(container.innerHTML).toBe('');
  });

  it('should render form when open is true', () => {
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={vi.fn()} loading={false} />,
    );

    expect(screen.getByText('New Project')).toBeDefined();
    expect(screen.getByLabelText('Project name')).toBeDefined();
    expect(screen.getByLabelText('Template (optional)')).toBeDefined();
    expect(screen.getByLabelText('Design theme (optional)')).toBeDefined();
  });

  it('should call onCreate with name on submit', () => {
    const handleCreate = vi.fn();
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={handleCreate} loading={false} />,
    );

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'My Project' } });
    fireEvent.click(screen.getByText('Create'));

    expect(handleCreate).toHaveBeenCalledWith('My Project', undefined, undefined);
  });

  it('should disable Create button when name is empty', () => {
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={vi.fn()} loading={false} />,
    );

    const createButton = screen.getByText('Create');
    expect(createButton.closest('button')?.disabled).toBe(true);
  });

  it('should show Creating... when loading', () => {
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={vi.fn()} loading={true} />,
    );

    expect(screen.getByText('Creating...')).toBeDefined();
  });

  it('should call onClose when Cancel is clicked', () => {
    const handleClose = vi.fn();
    render(
      <CreateProjectDialog open={true} onClose={handleClose} onCreate={vi.fn()} loading={false} />,
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(handleClose).toHaveBeenCalled();
  });
});
