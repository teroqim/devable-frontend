'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
} from 'lucide-react';
import clsx from 'clsx';
import type { FileTreeEntry } from '@/types/api';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import { renderFileIcon } from '../FileTreePanel.utils';
import './FileTreeNode.css';

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface FileTreeNodeProps {
  entry: FileTreeEntry;
  onRequestChildren?: (path: string) => Promise<FileTreeEntry[]>;
  onDelete?: (path: string) => void;
  onRename?: (path: string) => void;
  onNewFile?: (parentPath: string) => void;
  onNewFolder?: (parentPath: string) => void;
  onDrop?: (sourcePath: string, targetDirPath: string) => void;
}

export default function FileTreeNode({
  entry,
  onRequestChildren,
  onDelete,
  onRename,
  onNewFile,
  onNewFolder,
  onDrop,
}: FileTreeNodeProps) {
  const { activeFilePath, selectFile } = useProjectEditor();
  const [expanded, setExpanded] = useState(false);
  const [lazyChildren, setLazyChildren] = useState<FileTreeEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropTarget, setDropTarget] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDirectory = entry.type === 'directory';
  const isActive = !isDirectory && activeFilePath === entry.path;
  const children = lazyChildren ?? entry.children;

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) {
      return;
    }

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  const handleClick = useCallback(async () => {
    if (isDirectory) {
      if (!expanded && entry.lazy && !lazyChildren && onRequestChildren) {
        setLoading(true);
        const fetched = await onRequestChildren(entry.path);
        setLazyChildren(fetched);
        setLoading(false);
      }
      setExpanded(prev => !prev);
    } else {
      selectFile(entry.path);
    }
  }, [isDirectory, expanded, entry.lazy, entry.path, lazyChildren, onRequestChildren, selectFile]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMenuAction = useCallback((action: string) => {
    setContextMenu(null);
    switch (action) {
      case 'new-file':
        if (onNewFile) {
          onNewFile(isDirectory ? entry.path : '');
        }
        break;
      case 'new-folder':
        if (onNewFolder) {
          onNewFolder(isDirectory ? entry.path : '');
        }
        break;
      case 'rename':
        if (onRename) {
          onRename(entry.path);
        }
        break;
      case 'delete':
        if (onDelete) {
          onDelete(entry.path);
        }
        break;
    }
  }, [entry.path, isDirectory, onNewFile, onNewFolder, onRename, onDelete]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', entry.path);
    e.dataTransfer.effectAllowed = 'move';
  }, [entry.path]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!isDirectory) {
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(true);
  }, [isDirectory]);

  const handleDragLeave = useCallback(() => {
    setDropTarget(false);
  }, []);

  const handleDropEvent = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDropTarget(false);
    const sourcePath = e.dataTransfer.getData('text/plain');
    if (sourcePath && sourcePath !== entry.path && onDrop) {
      onDrop(sourcePath, entry.path);
    }
  }, [entry.path, onDrop]);

  const iconElement = isDirectory
    ? (expanded
        ? <FolderOpenIcon className="file-tree-node-icon" />
        : <FolderIcon className="file-tree-node-icon" />)
    : renderFileIcon(entry.name, 'file-tree-node-icon');

  return (
    <div className="file-tree-node">
      <div
        ref={nodeRef}
        className={clsx('file-tree-node-row', {
          'file-tree-node-row--active': isActive,
          'file-tree-node-row--drop-target': dropTarget,
        })}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropEvent}
      >
        {isDirectory ? (
          <ChevronRightIcon
            className={clsx('file-tree-node-chevron', {
              'file-tree-node-chevron--expanded': expanded,
            })}
          />
        ) : (
          <span className="file-tree-node-chevron-placeholder" />
        )}
        {iconElement}
        <span className="file-tree-node-name" title={entry.path}>
          {entry.name}
        </span>
      </div>
      {contextMenu && (
        <div
          ref={menuRef}
          className="file-tree-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {isDirectory && (
            <>
              <button className="file-tree-context-menu-item" onClick={() => handleMenuAction('new-file')}>
                New File
              </button>
              <button className="file-tree-context-menu-item" onClick={() => handleMenuAction('new-folder')}>
                New Folder
              </button>
              <div className="file-tree-context-menu-separator" />
            </>
          )}
          <button className="file-tree-context-menu-item" onClick={() => handleMenuAction('rename')}>
            Rename
          </button>
          <button className="file-tree-context-menu-item file-tree-context-menu-item--danger" onClick={() => handleMenuAction('delete')}>
            Delete
          </button>
        </div>
      )}
      {isDirectory && expanded && children && (
        <div className="file-tree-node-children">
          {loading && <div className="file-tree-node-row">Loading...</div>}
          {children.map(child => (
            <FileTreeNode
              key={child.path}
              entry={child}
              onRequestChildren={onRequestChildren}
              onDelete={onDelete}
              onRename={onRename}
              onNewFile={onNewFile}
              onNewFolder={onNewFolder}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}
