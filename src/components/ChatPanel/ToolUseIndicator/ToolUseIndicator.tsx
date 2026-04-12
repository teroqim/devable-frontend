'use client';

import { useState } from 'react';
import {
  ChevronRight as ChevronRightIcon,
  Wrench as WrenchIcon,
  Loader2 as SpinnerIcon,
} from 'lucide-react';
import clsx from 'clsx';
import './ToolUseIndicator.css';

interface ToolUseProps {
  tool: {
    tool: string;
    id: string;
    input?: unknown;
    output?: string;
    isComplete?: boolean;
  };
}

/** Extract a human-readable summary from tool input. */
function getToolSummary(toolName: string, input: unknown): string {
  if (!input || typeof input !== 'object') {
    return toolName;
  }
  const obj = input as Record<string, unknown>;

  // File operations: show the file path
  if (obj.file_path && typeof obj.file_path === 'string') {
    return `${toolName}: ${obj.file_path}`;
  }

  // Command execution: show the command
  if (obj.command && typeof obj.command === 'string') {
    const cmd = obj.command as string;
    return `${toolName}: ${cmd.length > 60 ? cmd.slice(0, 60) + '...' : cmd}`;
  }

  return toolName;
}

export default function ToolUseIndicator({ tool }: ToolUseProps) {
  const [expanded, setExpanded] = useState(false);

  function handleToggle() {
    setExpanded((prev) => !prev);
  }

  const summary = getToolSummary(tool.tool, tool.input);
  const isRunning = !tool.isComplete;

  return (
    <div className="tool-use">
      <button className="tool-use-header" onClick={handleToggle}>
        {isRunning ? (
          <SpinnerIcon size={12} className="tool-use-spinner" />
        ) : (
          <WrenchIcon size={12} />
        )}
        <span className="tool-use-name">{summary}</span>
        <ChevronRightIcon
          size={12}
          className={clsx('tool-use-chevron', expanded && 'tool-use-chevron--expanded')}
        />
      </button>
      {expanded && tool.output && (
        <pre className="tool-use-output">{tool.output}</pre>
      )}
    </div>
  );
}
