import { LANGUAGE_MAP, FILENAME_LANGUAGE_MAP } from './CodeEditorPanel.constants';

/** Determine the Monaco language identifier for a file path. */
export function getLanguageForFile(filePath: string): string {
  const filename = filePath.split('/').pop() ?? filePath;

  if (FILENAME_LANGUAGE_MAP[filename]) {
    return FILENAME_LANGUAGE_MAP[filename];
  }

  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex >= 0) {
    const ext = filename.slice(dotIndex);
    if (LANGUAGE_MAP[ext]) {
      return LANGUAGE_MAP[ext];
    }
  }

  return 'plaintext';
}
