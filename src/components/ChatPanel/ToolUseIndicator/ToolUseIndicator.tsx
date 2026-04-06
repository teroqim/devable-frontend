'use client';

import { useState } from 'react';
import { ChevronRight as ChevronRightIcon, Wrench as WrenchIcon } from 'lucide-react';
import clsx from 'clsx';
import './ToolUseIndicator.css';

interface ToolUseIndicatorProps {
  tool: {
    tool: string;
    id: string;
    input?: unknown;
    output?: string;
  };
}

export default function ToolUseIndicator({ tool }: ToolUseIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  function handleToggle() {
    setExpanded((prev) => !prev);
  }

  return (
    <div className="tool-use">
      <button className="tool-use-header" onClick={handleToggle}>
        <WrenchIcon size={12} />
        <span className="tool-use-name">{tool.tool}</span>
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
