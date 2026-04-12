export interface FileTreeAction {
  type: 'rename' | 'delete' | 'new-file' | 'new-folder';
  path: string;
}
