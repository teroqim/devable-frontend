'use client';

import { useState, useCallback } from 'react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import { PanelLeftClose as PanelLeftCloseIcon, PanelLeftOpen as PanelLeftOpenIcon } from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import PreviewPanel from '@/components/PreviewPanel/PreviewPanel';
import FileTreePanel from '@/components/FileTreePanel/FileTreePanel';
import CodeEditorPanel from '@/components/CodeEditorPanel/CodeEditorPanel';
import LogsPanel from '@/components/LogsPanel/LogsPanel';
import ViewTabBar from './ViewTabBar/ViewTabBar';
import './MainArea.css';

function CodeView({ showFileTree, onToggleFileTree }: { showFileTree: boolean; onToggleFileTree: () => void }) {
  return (
    <div className="main-area-code-view">
      <div className="main-area-code-view-toolbar">
        <Button variant="ghost" size="icon" onClick={onToggleFileTree} title={showFileTree ? 'Hide file tree' : 'Show file tree'}>
          {showFileTree ? <PanelLeftCloseIcon size={14} /> : <PanelLeftOpenIcon size={14} />}
        </Button>
      </div>
      <div className="main-area-code-view-body">
        {showFileTree && <FileTreePanel />}
        <CodeEditorPanel />
      </div>
    </div>
  );
}

export default function MainArea() {
  const { activeView, project } = useProjectEditor();
  const [showFileTree, setShowFileTree] = useState(true);

  const handleToggleFileTree = useCallback(() => {
    setShowFileTree(prev => !prev);
  }, []);

  function renderContent() {
    if (!project) {
      return <div className="main-area-placeholder">No project loaded</div>;
    }

    switch (activeView) {
      case 'code':
        return <CodeView showFileTree={showFileTree} onToggleFileTree={handleToggleFileTree} />;
      case 'preview':
        return <PreviewPanel project={project} />;
      case 'logs':
        return <LogsPanel />;
      case 'split':
        return (
          <PanelGroup orientation="horizontal" className="main-area-split">
            <Panel defaultSize={50} minSize={20}>
              <CodeView showFileTree={showFileTree} onToggleFileTree={handleToggleFileTree} />
            </Panel>
            <PanelResizeHandle className="main-area-split-handle" />
            <Panel minSize={20}>
              <PreviewPanel project={project} />
            </Panel>
          </PanelGroup>
        );
      default:
        return null;
    }
  }

  return (
    <div className="main-area">
      <ViewTabBar />
      <div className="main-area-content">
        {renderContent()}
      </div>
    </div>
  );
}
