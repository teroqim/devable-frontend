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
    expect(screen.getByText('Template')).toBeDefined();
    expect(screen.getByText('Design theme')).toBeDefined();
  });

  it('should render template cards', () => {
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={vi.fn()} loading={false} />,
    );

    expect(screen.getByText('Next.js + TypeScript')).toBeDefined();
    expect(screen.getByText('Elysia API')).toBeDefined();
    expect(screen.getByText('Full-stack')).toBeDefined();
  });

  it('should render theme cards', () => {
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={vi.fn()} loading={false} />,
    );

    expect(screen.getByText('Clean')).toBeDefined();
    expect(screen.getByText('Bold')).toBeDefined();
    expect(screen.getByText('Soft')).toBeDefined();
  });

  it('should call onCreate with name, template, and theme on submit', () => {
    const handleCreate = vi.fn();
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={handleCreate} loading={false} />,
    );

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'My Project' } });
    fireEvent.click(screen.getByText('Create'));

    // Defaults: nextjs-ts template, clean theme
    expect(handleCreate).toHaveBeenCalledWith('My Project', 'nextjs-ts', 'clean');
  });

  it('should pass selected template and theme to onCreate', () => {
    const handleCreate = vi.fn();
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={handleCreate} loading={false} />,
    );

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'My Project' } });
    fireEvent.click(screen.getByText('Full-stack'));
    fireEvent.click(screen.getByText('Bold'));
    fireEvent.click(screen.getByText('Create'));

    expect(handleCreate).toHaveBeenCalledWith('My Project', 'fullstack', 'bold');
  });

  it('should hide theme picker when API template is selected', () => {
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={vi.fn()} loading={false} />,
    );

    fireEvent.click(screen.getByText('Elysia API'));

    expect(screen.queryByText('Design theme')).toBeNull();
  });

  it('should not pass designTheme for API template', () => {
    const handleCreate = vi.fn();
    render(
      <CreateProjectDialog open={true} onClose={vi.fn()} onCreate={handleCreate} loading={false} />,
    );

    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'My API' } });
    fireEvent.click(screen.getByText('Elysia API'));
    fireEvent.click(screen.getByText('Create'));

    expect(handleCreate).toHaveBeenCalledWith('My API', 'bun-elysia-api', undefined);
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
