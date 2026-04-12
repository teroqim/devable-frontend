import type { ApiProject } from '@/types/api';

export type MainView = 'code' | 'preview' | 'logs' | 'split';

export interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
  modifiedAt: string;
}

export interface ProjectEditorState {
  project: ApiProject | null;
  /** Re-fetch project from backend to update status after actions like start/stop/rebuild. */
  refreshProjectAsync: () => Promise<void>;
  // Main area view
  activeView: MainView;
  setActiveView: (view: MainView) => void;
  // File tree & editor
  openFiles: OpenFile[];
  activeFilePath: string | null;
  selectFile: (path: string) => void;
  closeFile: (path: string) => void;
  markFileDirty: (path: string, isDirty: boolean) => void;
  // File tree refresh
  fileTreeVersion: number;
  refreshFileTree: () => void;
  // Agent state
  isAgentStreaming: boolean;
  setIsAgentStreaming: (streaming: boolean) => void;
  lastAgentFileChange: number;
  notifyAgentFileChange: () => void;
}
