'use client';

import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import './EditorFooter.css';

export default function EditorFooter() {
  const { project } = useProjectEditor();

  const isConnected = project?.status === 'running';

  return (
    <footer className="editor-footer">
      <div className="editor-footer-item">
        <span className={`editor-footer-dot editor-footer-dot--${isConnected ? 'connected' : 'disconnected'}`} />
        {isConnected ? 'Connected' : 'Disconnected'}
      </div>
    </footer>
  );
}
