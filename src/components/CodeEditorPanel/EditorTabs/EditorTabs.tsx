'use client';

import { useCallback } from 'react';
import { X as XIcon } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button/button';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import './EditorTabs.css';

export default function EditorTabs() {
  const { openFiles, activeFilePath, selectFile, closeFile } = useProjectEditor();

  const handleTabClick = useCallback((path: string) => {
    selectFile(path);
  }, [selectFile]);

  const handleCloseClick = useCallback((e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    closeFile(path);
  }, [closeFile]);

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className="editor-tabs">
      {openFiles.map(file => {
        const filename = file.path.split('/').pop() ?? file.path;
        return (
          <div
            key={file.path}
            className={clsx('editor-tab', {
              'editor-tab--active': file.path === activeFilePath,
            })}
            onClick={() => handleTabClick(file.path)}
            title={file.path}
          >
            {filename}
            {file.isDirty && <span className="editor-tab-dirty" />}
            <Button
              variant="ghost"
              size="icon"
              className="editor-tab-close"
              onClick={(e) => handleCloseClick(e, file.path)}
              title="Close"
            >
              <XIcon size={10} />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
