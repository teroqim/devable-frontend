'use client';

import {
  Code as CodeIcon,
  Eye as EyeIcon,
  Terminal as TerminalIcon,
  Columns as ColumnsIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button/button';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import type { MainView } from '@/contexts/ProjectEditorContext.types';
import './ViewTabBar.css';

interface TabDef {
  view: MainView;
  label: string;
  icon: typeof CodeIcon;
}

const tabs: TabDef[] = [
  { view: 'code', label: 'Code', icon: CodeIcon },
  { view: 'preview', label: 'Preview', icon: EyeIcon },
  { view: 'logs', label: 'Logs', icon: TerminalIcon },
  { view: 'split', label: 'Split', icon: ColumnsIcon },
];

export default function ViewTabBar() {
  const { activeView, setActiveView } = useProjectEditor();

  return (
    <div className="view-tab-bar">
      {tabs.map(tab => {
        const IconComponent = tab.icon;
        return (
          <Button
            key={tab.view}
            variant="ghost"
            size="sm"
            className={clsx('view-tab-bar-button', {
              'view-tab-bar-button--active': activeView === tab.view,
            })}
            onClick={() => setActiveView(tab.view)}
          >
            <IconComponent size={14} />
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
