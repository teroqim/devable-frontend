'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Trash2 as TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import { fetchLogsAsync, streamLogsAsync } from '@/lib/api-client';
import type { LogStreamEvent } from '@/types/api';
import './LogsPanel.css';

export default function LogsPanel() {
  const { project } = useProjectEditor();
  const { getToken } = useAuth();
  const [logLines, setLogLines] = useState<string[]>([]);
  const [follow, setFollow] = useState(false);
  const [service, setService] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load initial logs
  useEffect(() => {
    if (!project) {
      return;
    }

    async function loadAsync() {
      const result = await fetchLogsAsync(
        getToken,
        project!.id,
        service || undefined,
        200,
      );
      if (result.success && result.data) {
        const lines = result.data.logs.split('\n').filter(l => l.length > 0);
        setLogLines(lines);
      }
    }
    loadAsync();
  }, [project, getToken, service]);

  // Handle follow mode (SSE streaming)
  useEffect(() => {
    if (!follow || !project) {
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const MAX_LOG_LINES = 10000;
    const handleEvent = (event: LogStreamEvent) => {
      if (event.type === 'log' && event.line) {
        setLogLines(prev => {
          const updated = [...prev, event.line!];
          return updated.length > MAX_LOG_LINES ? updated.slice(-MAX_LOG_LINES) : updated;
        });
      }
    };

    streamLogsAsync(getToken, project.id, handleEvent, {
      service: service || undefined,
      signal: abortController.signal,
    });

    return () => {
      abortController.abort();
      abortControllerRef.current = null;
    };
  }, [follow, project, getToken, service]);

  // Auto-scroll when following
  useEffect(() => {
    if (follow && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [logLines, follow]);

  const handleClear = useCallback(() => {
    setLogLines([]);
  }, []);

  const handleFollowToggle = useCallback(() => {
    setFollow(prev => !prev);
  }, []);

  const handleServiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setService(e.target.value);
  }, []);

  if (!project) {
    return (
      <div className="logs-panel">
        <div className="logs-panel-empty">No project loaded</div>
      </div>
    );
  }

  const services = project.containers?.map(c => c.name) ?? [];

  return (
    <div className="logs-panel">
      <div className="logs-panel-toolbar">
        <div className="logs-panel-toolbar-left">
          {services.length > 0 && (
            <select
              id="logs-service-filter"
              className="logs-panel-service-select"
              value={service}
              onChange={handleServiceChange}
            >
              <option value="">All services</option>
              {services.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
        <div className="logs-panel-toolbar-right">
          <label className="logs-panel-follow-label">
            <input id="logs-follow" type="checkbox" checked={follow} onChange={handleFollowToggle} />
            Follow
          </label>
          <Button variant="ghost" size="icon" onClick={handleClear} title="Clear">
            <TrashIcon size={14} />
          </Button>
        </div>
      </div>
      <div className="logs-panel-content" ref={contentRef}>
        {logLines.length === 0 ? (
          <div className="logs-panel-empty">No logs available</div>
        ) : (
          logLines.join('\n')
        )}
      </div>
    </div>
  );
}
