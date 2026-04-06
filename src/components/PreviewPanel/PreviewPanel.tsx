'use client';

import { useRef, useState } from 'react';
import { RefreshCw as RefreshIcon, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import type { ApiProject } from '@/types/api';
import './PreviewPanel.css';

interface PreviewPanelProps {
  project: ApiProject;
}

export default function PreviewPanel({ project }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const previewUrl = project.previewUrl.startsWith('http')
    ? project.previewUrl
    : `http://${project.previewUrl}`;

  function handleRefresh() {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  }

  function handleOpenInTab() {
    window.open(previewUrl, '_blank');
  }

  function handleAutoRefreshToggle() {
    setAutoRefresh((prev) => !prev);
  }

  return (
    <div className="preview-panel">
      <div className="preview-panel-toolbar">
        <span className="preview-panel-url">{project.previewUrl}</span>
        <div className="preview-panel-actions">
          <label className="preview-panel-auto-refresh">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={handleAutoRefreshToggle}
            />
            Auto-refresh
          </label>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshIcon size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenInTab}>
            <ExternalLinkIcon size={14} />
          </Button>
        </div>
      </div>
      <div className="preview-panel-iframe-container">
        {project.status === 'running' ? (
          <iframe
            ref={iframeRef}
            className="preview-panel-iframe"
            src={previewUrl}
            title={`Preview: ${project.name}`}
          />
        ) : (
          <div className="preview-panel-placeholder">
            Project is not running. Start it to see the preview.
          </div>
        )}
      </div>
    </div>
  );
}
