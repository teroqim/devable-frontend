'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button/button';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import { fetchFileContentAsync, writeFileContentAsync } from '@/lib/api-client';
import { isInfrastructureFile } from '@/components/FileTreePanel/FileTreePanel.utils';
import { getLanguageForFile } from './CodeEditorPanel.utils';
import EditorTabs from './EditorTabs/EditorTabs';
import './CodeEditorPanel.css';

export default function CodeEditorPanel() {
  const {
    project,
    openFiles,
    activeFilePath,
    markFileDirty,
    lastAgentFileChange,
    isAgentStreaming,
  } = useProjectEditor();
  const { getToken } = useAuth();
  const [fileContent, setFileContent] = useState<string>('');
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [fileLoadedAtAgentChange, setFileLoadedAtAgentChange] = useState(0);
  const editorRef = useRef<unknown>(null);
  const lastSavedContentRef = useRef<string>('');

  const activeFile = openFiles.find(f => f.path === activeFilePath);

  // Show banner when agent modifies a file while the user has unsaved changes
  const shouldShowBanner = !bannerDismissed
    && activeFile?.isDirty === true
    && lastAgentFileChange > fileLoadedAtAgentChange;

  // Shared file loading logic used by both effects below
  const loadFileFromDiskAsync = useCallback(async (signal: { cancelled: boolean }) => {
    if (!project || !activeFilePath) {
      return;
    }
    const result = await fetchFileContentAsync(getToken, project.id, activeFilePath);
    if (signal.cancelled) {
      return;
    }
    if (result.success && result.data) {
      if (result.data.content !== lastSavedContentRef.current) {
        setFileContent(result.data.content);
        lastSavedContentRef.current = result.data.content;
      }
      setBannerDismissed(false);
      setFileLoadedAtAgentChange(Date.now());
    }
  }, [project, activeFilePath, getToken]);

  // Load file content when a new file is selected
  useEffect(() => {
    if (!project || !activeFilePath) {
      return;
    }
    const signal = { cancelled: false };
    loadFileFromDiskAsync(signal); // eslint-disable-line react-hooks/set-state-in-effect -- async data fetch
    return () => { signal.cancelled = true; };
  }, [project, activeFilePath, loadFileFromDiskAsync]);

  // Reload the active file after the agent finishes streaming
  const wasStreamingRef = useRef(false);

  useEffect(() => {
    if (isAgentStreaming) {
      wasStreamingRef.current = true;
      return;
    }
    if (!wasStreamingRef.current || !project || !activeFilePath || activeFile?.isDirty) {
      return;
    }
    wasStreamingRef.current = false;

    const signal = { cancelled: false };
    loadFileFromDiskAsync(signal); // eslint-disable-line react-hooks/set-state-in-effect -- async data fetch
    return () => { signal.cancelled = true; };
  }, [isAgentStreaming, project, activeFilePath, activeFile?.isDirty, loadFileFromDiskAsync]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined || !activeFilePath) {
      return;
    }
    setFileContent(value);
    const isDirty = value !== lastSavedContentRef.current;
    markFileDirty(activeFilePath, isDirty);
  }, [activeFilePath, markFileDirty]);

  const handleSaveAsync = useCallback(async () => {
    if (!project || !activeFilePath) {
      return;
    }

    const filename = activeFilePath.split('/').pop() ?? activeFilePath;
    if (isInfrastructureFile(filename)) {
      const confirmed = window.confirm(
        `"${filename}" is an infrastructure file. Saving changes may require a container rebuild. Continue?`,
      );
      if (!confirmed) {
        return;
      }
    }

    const result = await writeFileContentAsync(getToken, project.id, activeFilePath, fileContent);
    if (result.success) {
      lastSavedContentRef.current = fileContent;
      markFileDirty(activeFilePath, false);
    }
  }, [project, activeFilePath, fileContent, getToken, markFileDirty]);

  // Use a ref so the Monaco keybinding always calls the latest save handler,
  // not the one captured at mount time (which would have stale fileContent).
  const saveHandlerRef = useRef(handleSaveAsync);
  useEffect(() => {
    saveHandlerRef.current = handleSaveAsync;
  }, [handleSaveAsync]);

  const handleEditorMount = useCallback((editor: unknown) => {
    editorRef.current = editor;

    // Register Ctrl+S / Cmd+S save keybinding
    const monacoEditor = editor as { addCommand: (keybinding: number, handler: () => void) => void };
    monacoEditor.addCommand(2048 | 49, () => saveHandlerRef.current());
  }, []);

  const handleReloadFromDisk = useCallback(async () => {
    if (!project || !activeFilePath) {
      return;
    }
    const result = await fetchFileContentAsync(getToken, project.id, activeFilePath);
    if (result.success && result.data) {
      setFileContent(result.data.content);
      lastSavedContentRef.current = result.data.content;
      markFileDirty(activeFilePath, false);
      setBannerDismissed(true);
    }
  }, [project, activeFilePath, getToken, markFileDirty]);

  const handleDismissBanner = useCallback(() => {
    setBannerDismissed(true);
  }, []);

  if (!activeFilePath || !activeFile) {
    return (
      <div className="code-editor-panel">
        <EditorTabs />
        <div className="code-editor-panel-placeholder">
          Select a file to edit
        </div>
      </div>
    );
  }

  const language = getLanguageForFile(activeFilePath);

  return (
    <div className="code-editor-panel">
      <EditorTabs />
      {shouldShowBanner && (
        <div className="code-editor-panel-banner">
          <span>File modified by agent.</span>
          <div className="code-editor-panel-banner-actions">
            <Button variant="outline" size="sm" onClick={handleReloadFromDisk}>
              Reload
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDismissBanner}>
              Keep my changes
            </Button>
          </div>
        </div>
      )}
      <div className="code-editor-panel-container">
        <Editor
          language={language}
          value={fileContent}
          theme="vs-dark"
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
