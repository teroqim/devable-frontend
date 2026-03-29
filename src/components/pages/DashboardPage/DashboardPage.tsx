'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchProjects, createProject, deleteProject, startProject, stopProject } from '@/lib/api-client';
import type { ApiProject } from '@/types/api';
import Heading from '@/components/ui/heading/Heading';
import { Button } from '@/components/ui/button/button';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import CreateProjectDialog from '@/components/CreateProjectDialog/CreateProjectDialog';
import DeleteProjectDialog from '@/components/DeleteProjectDialog/DeleteProjectDialog';
import { Plus as PlusIcon } from 'lucide-react';
import './DashboardPage.css';

export default function DashboardPage() {
  const { getToken, isLoaded } = useAuth();
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      if (!isLoaded) return;

      setLoading(true);
      try {
        const data = await fetchProjects(getToken);
        setProjects(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [isLoaded, getToken]);

  async function handleCreate(name: string, template?: string, designTheme?: string) {
    setCreating(true);
    try {
      await createProject({ name, template, designTheme }, getToken);
      const data = await fetchProjects(getToken);
      setProjects(data);
      setShowCreateDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id, getToken);
      const data = await fetchProjects(getToken);
      setProjects(data);
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  }

  async function handleStart(id: string) {
    try {
      await startProject(id, getToken);
      const data = await fetchProjects(getToken);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start project');
    }
  }

  async function handleStop(id: string) {
    try {
      await stopProject(id, getToken);
      const data = await fetchProjects(getToken);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop project');
    }
  }

  function handleOpenCreateDialog() {
    setShowCreateDialog(true);
  }

  function handleCloseCreateDialog() {
    setShowCreateDialog(false);
  }

  function handleRequestDelete(id: string) {
    const project = projects.find(p => p.id === id);
    if (project) setDeleteTarget(project);
  }

  function handleCloseDeleteDialog() {
    setDeleteTarget(null);
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-loading">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Heading as="h1" size="lg">Projects</Heading>
        <Button onClick={handleOpenCreateDialog}>
          <PlusIcon /> New Project
        </Button>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      {projects.length === 0 ? (
        <div className="dashboard-empty">
          <p>No projects yet. Create your first project to get started.</p>
        </div>
      ) : (
        <div className="dashboard-projects">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onStart={handleStart}
              onStop={handleStop}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={showCreateDialog}
        onClose={handleCloseCreateDialog}
        onCreate={handleCreate}
        loading={creating}
      />

      <DeleteProjectDialog
        open={deleteTarget !== null}
        projectName={deleteTarget?.name ?? ''}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
