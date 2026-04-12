'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft as ArrowLeftIcon,
  Play as PlayIcon,
  Square as StopIcon,
  RotateCw as RestartIcon,
  Hammer as RebuildIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button/button';
import Heading from '@/components/ui/heading/Heading';
import { startProjectAsync, stopProjectAsync, restartProjectAsync, rebuildProjectAsync } from '@/lib/api-client';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import './EditorHeader.css';

export default function EditorHeader() {
  const { project, refreshProjectAsync } = useProjectEditor();
  const { getToken } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((message: string) => {
    setError(message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => setError(null), 5000);
  }, []);

  // Clean up error timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleBackClick = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  /** Shared handler for start/stop/restart — calls the API, refreshes project, shows errors. */
  const handleProjectAction = useCallback(async (
    actionFn: (id: string, getToken: () => Promise<string | null>) => Promise<unknown>,
    errorLabel: string,
  ) => {
    if (!project) {
      return;
    }
    try {
      await actionFn(project.id, getToken);
      await refreshProjectAsync();
    } catch (err) {
      const message = err instanceof Error ? err.message : errorLabel;
      showError(message);
    }
  }, [project, getToken, showError, refreshProjectAsync]);

  const handleStartClick = useCallback(() => {
    handleProjectAction(startProjectAsync, 'Failed to start project');
  }, [handleProjectAction]);

  const handleStopClick = useCallback(() => {
    handleProjectAction(stopProjectAsync, 'Failed to stop project');
  }, [handleProjectAction]);

  const handleRestartClick = useCallback(() => {
    handleProjectAction(restartProjectAsync, 'Failed to restart project');
  }, [handleProjectAction]);

  const handleRebuildClick = useCallback(async () => {
    if (!project) {
      return;
    }
    const result = await rebuildProjectAsync(getToken, project.id);
    if (!result.success) {
      showError(result.error);
    }
    await refreshProjectAsync();
  }, [project, getToken, showError, refreshProjectAsync]);

  if (!project) {
    return null;
  }

  const status = project.status;
  const isRunning = status === 'running';
  const isRebuilding = status === 'rebuilding';

  return (
    <header className="editor-header">
      <Button variant="ghost" size="sm" onClick={handleBackClick}>
        <ArrowLeftIcon size={16} />
        Back
      </Button>
      <Heading as="h1" size="sm" className="editor-header-name">
        {project.name}
      </Heading>
      <div className="editor-header-status">
        <span className={clsx('editor-header-status-dot', `editor-header-status-dot--${status}`)} />
        {status}
      </div>
      {error && <span className="editor-header-error">{error}</span>}
      <div className="editor-header-controls">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartClick}
          disabled={isRunning || isRebuilding}
          title="Start"
        >
          <PlayIcon size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStopClick}
          disabled={!isRunning}
          title="Stop"
        >
          <StopIcon size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRestartClick}
          disabled={!isRunning}
          title="Restart"
        >
          <RestartIcon size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRebuildClick}
          disabled={isRebuilding}
          title="Rebuild containers"
        >
          <RebuildIcon size={14} />
        </Button>
      </div>
    </header>
  );
}
