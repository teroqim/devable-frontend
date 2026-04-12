'use client';

import { use, useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { fetchProject } from '@/lib/api-client';
import type { ApiProject } from '@/types/api';
import { Button } from '@/components/ui/button/button';
import { ProjectEditorProvider } from '@/contexts/ProjectEditorContext';
import EditorHeader from '@/components/EditorHeader/EditorHeader';
import EditorFooter from '@/components/EditorFooter/EditorFooter';
import ChatPanel from '@/components/ChatPanel/ChatPanel';
import MainArea from '@/components/MainArea/MainArea';
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
    if (!isLoaded) {
      return;
    }

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
    <ProjectEditorProvider initialProject={project} getToken={getToken}>
      <div className="editor-page">
        <EditorHeader />
        <PanelGroup orientation="horizontal" defaultLayout={{ chat: 35, main: 65 }} className="editor-panels">
          <Panel id="chat" minSize={20} className="editor-panel-chat">
            <ChatPanel project={project} />
          </Panel>
          <PanelResizeHandle className="editor-resize-handle" />
          <Panel id="main" minSize={30} className="editor-panel-main">
            <MainArea />
          </Panel>
        </PanelGroup>
        <EditorFooter />
      </div>
    </ProjectEditorProvider>
  );
}
