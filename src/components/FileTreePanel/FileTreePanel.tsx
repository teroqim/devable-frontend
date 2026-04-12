'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  RefreshCw as RefreshIcon,
  FilePlus as FilePlusIcon,
  FolderPlus as FolderPlusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import {
  fetchFileTreeAsync,
  createFileAsync,
  deleteFileAsync,
  renameFileAsync,
} from '@/lib/api-client';
import type { FileTreeEntry } from '@/types/api';
import { isInfrastructureFile } from './FileTreePanel.utils';
import FileTreeNode from './FileTreeNode/FileTreeNode';
import './FileTreePanel.css';

export default function FileTreePanel() {
  const { project, fileTreeVersion, refreshFileTree, isAgentStreaming } = useProjectEditor();
  const { getToken } = useAuth();
  const [tree, setTree] = useState<FileTreeEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadTreeAsync = useCallback(async () => {
    if (!project) {
      return;
    }
    const result = await fetchFileTreeAsync(getToken, project.id);
    if (result.success && result.data) {
      setTree(result.data.tree);
      setError(null);
    } else if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  }, [project, getToken]);

  // Load tree on mount and when fileTreeVersion changes
  useEffect(() => {
    loadTreeAsync(); // eslint-disable-line react-hooks/set-state-in-effect -- async data fetch
  }, [loadTreeAsync, fileTreeVersion]);

  // Poll every 10s while agent is streaming
  useEffect(() => {
    if (isAgentStreaming) {
      pollingRef.current = setInterval(loadTreeAsync, 10000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isAgentStreaming, loadTreeAsync]);

  const handleRequestChildrenAsync = useCallback(async (path: string): Promise<FileTreeEntry[]> => {
    if (!project) {
      return [];
    }
    const result = await fetchFileTreeAsync(getToken, project.id, 3, path);
    if (result.success && result.data) {
      return result.data.tree;
    }
    return [];
  }, [project, getToken]);

  const handleDelete = useCallback(async (filePath: string) => {
    if (!project) {
      return;
    }
    const filename = filePath.split('/').pop() ?? filePath;
    if (isInfrastructureFile(filename)) {
      const confirmed = window.confirm(
        `"${filename}" is an infrastructure file. Deleting it may prevent containers from being rebuilt. Are you sure?`,
      );
      if (!confirmed) {
        return;
      }
    } else {
      const confirmed = window.confirm(`Delete "${filename}"?`);
      if (!confirmed) {
        return;
      }
    }
    await deleteFileAsync(getToken, project.id, filePath);
    refreshFileTree();
  }, [project, getToken, refreshFileTree]);

  const handleRename = useCallback(async (filePath: string) => {
    if (!project) {
      return;
    }
    const filename = filePath.split('/').pop() ?? filePath;
    if (isInfrastructureFile(filename)) {
      const confirmed = window.confirm(
        `"${filename}" is an infrastructure file. Renaming or moving it may affect container rebuilds. Continue?`,
      );
      if (!confirmed) {
        return;
      }
    }
    const newPath = window.prompt('New path:', filePath);
    if (!newPath || newPath === filePath) {
      return;
    }
    await renameFileAsync(getToken, project.id, filePath, newPath);
    refreshFileTree();
  }, [project, getToken, refreshFileTree]);

  const handleNewFile = useCallback(async (parentPath: string) => {
    if (!project) {
      return;
    }
    const name = window.prompt('File name:');
    if (!name) {
      return;
    }
    const fullPath = parentPath ? `${parentPath}/${name}` : name;
    await createFileAsync(getToken, project.id, { path: fullPath, type: 'file' });
    refreshFileTree();
  }, [project, getToken, refreshFileTree]);

  const handleNewFolder = useCallback(async (parentPath: string) => {
    if (!project) {
      return;
    }
    const name = window.prompt('Folder name:');
    if (!name) {
      return;
    }
    const fullPath = parentPath ? `${parentPath}/${name}` : name;
    await createFileAsync(getToken, project.id, { path: fullPath, type: 'directory' });
    refreshFileTree();
  }, [project, getToken, refreshFileTree]);

  const handleDrop = useCallback(async (sourcePath: string, targetDirPath: string) => {
    if (!project) {
      return;
    }
    const filename = sourcePath.split('/').pop() ?? sourcePath;
    if (isInfrastructureFile(filename)) {
      const confirmed = window.confirm(
        `"${filename}" is an infrastructure file. Moving it may affect container rebuilds. Continue?`,
      );
      if (!confirmed) {
        return;
      }
    }
    const newPath = `${targetDirPath}/${filename}`;
    await renameFileAsync(getToken, project.id, sourcePath, newPath);
    refreshFileTree();
  }, [project, getToken, refreshFileTree]);

  const handleNewFileRoot = useCallback(() => {
    handleNewFile('');
  }, [handleNewFile]);

  const handleNewFolderRoot = useCallback(() => {
    handleNewFolder('');
  }, [handleNewFolder]);

  if (loading) {
    return (
      <div className="file-tree-panel">
        <div className="file-tree-panel-empty">Loading files...</div>
      </div>
    );
  }

  return (
    <div className="file-tree-panel">
      <div className="file-tree-panel-header">
        <span className="file-tree-panel-title">Files</span>
        <div className="file-tree-panel-actions">
          <Button variant="ghost" size="icon" onClick={handleNewFileRoot} title="New file">
            <FilePlusIcon size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNewFolderRoot} title="New folder">
            <FolderPlusIcon size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={refreshFileTree} title="Refresh">
            <RefreshIcon size={14} />
          </Button>
        </div>
      </div>
      <div className="file-tree-panel-content">
        {error && <div className="file-tree-panel-error">{error}</div>}
        {!error && tree.length === 0 && (
          <div className="file-tree-panel-empty">No files</div>
        )}
        {tree.map(entry => (
          <FileTreeNode
            key={entry.path}
            entry={entry}
            onRequestChildren={handleRequestChildrenAsync}
            onDelete={handleDelete}
            onRename={handleRename}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
