'use client';

import { Plus as PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import type { ApiChatSession } from '@/types/api';
import './SessionSelector.css';

interface SessionSelectorProps {
  sessions: ApiChatSession[];
  currentSessionId: string | null;
  onSessionChange: (sessionId: string) => void;
  onNewSession: () => void;
}

export default function SessionSelector({
  sessions,
  currentSessionId,
  onSessionChange,
  onNewSession,
}: SessionSelectorProps) {
  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onSessionChange(e.target.value);
  }

  return (
    <div className="session-selector">
      <select
        className="session-selector-dropdown"
        value={currentSessionId ?? ''}
        onChange={handleSelectChange}
        disabled={sessions.length === 0}
      >
        {sessions.length === 0 && <option value="">No sessions</option>}
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.sessionName}
          </option>
        ))}
      </select>
      <Button variant="ghost" size="sm" onClick={onNewSession}>
        <PlusIcon size={14} />
        New
      </Button>
    </div>
  );
}
