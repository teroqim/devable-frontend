'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ApiProject } from '@/types/api';
import { fetchProject } from '@/lib/api-client';
import type { MainView, OpenFile, ProjectEditorState } from './ProjectEditorContext.types';

const ProjectEditorContext = createContext<ProjectEditorState | null>(null);

interface ProjectEditorProviderProps {
  initialProject: ApiProject;
  getToken: () => Promise<string | null>;
  children: ReactNode;
}

export function ProjectEditorProvider({ initialProject, getToken, children }: ProjectEditorProviderProps) {
  const [project, setProject] = useState<ApiProject | null>(initialProject);
  const [activeView, setActiveView] = useState<MainView>('code');
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileTreeVersion, setFileTreeVersion] = useState(0);
  const [isAgentStreaming, setIsAgentStreaming] = useState(false);
  const [lastAgentFileChange, setLastAgentFileChange] = useState(0);

  const refreshProjectAsync = useCallback(async () => {
    if (!project) {
      return;
    }
    try {
      const updated = await fetchProject(project.id, getToken);
      setProject(updated);
    } catch (error) {
      console.error('Failed to refresh project:', error);
    }
  }, [project, getToken]);

  const selectFile = useCallback((path: string) => {
    setOpenFiles(prev => {
      if (prev.some(f => f.path === path)) {
        return prev;
      }
      return [...prev, { path, content: '', isDirty: false, modifiedAt: '' }];
    });
    setActiveFilePath(path);
  }, []);

  const closeFile = useCallback((path: string) => {
    let remainingFiles: OpenFile[] = [];
    setOpenFiles(prev => {
      remainingFiles = prev.filter(f => f.path !== path);
      return remainingFiles;
    });
    setActiveFilePath(prev => {
      if (prev !== path) {
        return prev;
      }
      return remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1].path : null;
    });
  }, []);

  const markFileDirty = useCallback((path: string, isDirty: boolean) => {
    setOpenFiles(prev =>
      prev.map(f => (f.path === path ? { ...f, isDirty } : f)),
    );
  }, []);

  const refreshFileTree = useCallback(() => {
    setFileTreeVersion(v => v + 1);
  }, []);

  const notifyAgentFileChange = useCallback(() => {
    setFileTreeVersion(v => v + 1);
    setLastAgentFileChange(Date.now());
  }, []);

  const value: ProjectEditorState = {
    project,
    refreshProjectAsync,
    activeView,
    setActiveView,
    openFiles,
    activeFilePath,
    selectFile,
    closeFile,
    markFileDirty,
    fileTreeVersion,
    refreshFileTree,
    isAgentStreaming,
    setIsAgentStreaming,
    lastAgentFileChange,
    notifyAgentFileChange,
  };

  return (
    <ProjectEditorContext.Provider value={value}>
      {children}
    </ProjectEditorContext.Provider>
  );
}

export function useProjectEditor(): ProjectEditorState {
  const context = useContext(ProjectEditorContext);
  if (!context) {
    throw new Error('useProjectEditor must be used within a ProjectEditorProvider');
  }
  return context;
}
