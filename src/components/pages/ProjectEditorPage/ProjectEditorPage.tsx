'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { fetchProject } from '@/lib/api-client';
import type { ApiProject } from '@/types/api';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import ChatPanel from '@/components/ChatPanel/ChatPanel';
import PreviewPanel from '@/components/PreviewPanel/PreviewPanel';
import './ProjectEditorPage.css';

interface ProjectEditorPageProps {
  paramsPromise: Promise<{ id: string }>;
}

export default function ProjectEditorPage({ paramsPromise }: ProjectEditorPageProps) {
  const params = use(paramsPromise);
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    async function loadAsync() {
      try {
        const data = await fetchProject(params.id, getToken);
        setProject(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load project';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    loadAsync();
  }, [isLoaded, params.id, getToken]);

  function handleBackClick() {
    router.push('/dashboard');
  }

  if (loading) {
    return <div className="editor-loading">Loading project...</div>;
  }

  if (error || !project) {
    return (
      <div className="editor-error">
        <p>{error ?? 'Project not found'}</p>
        <Button onClick={handleBackClick}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <Button variant="ghost" size="sm" onClick={handleBackClick}>
          <ArrowLeftIcon size={16} />
          Back
        </Button>
        <h1 className="editor-project-name">{project.name}</h1>
        <span className={`editor-status-badge editor-status-badge--${project.status}`}>
          {project.status}
        </span>
      </header>
      <div className="editor-content">
        <ChatPanel project={project} />
        <PreviewPanel project={project} />
      </div>
    </div>
  );
}
