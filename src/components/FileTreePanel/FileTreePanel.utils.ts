import { createElement } from 'react';
import type { ReactElement } from 'react';
import {
  EXTENSION_ICON_MAP,
  FILENAME_ICON_MAP,
  DEFAULT_FILE_ICON,
  INFRASTRUCTURE_FILE_PATTERNS,
  INFRASTRUCTURE_FILE_PREFIXES,
} from './FileTreePanel.constants';

/** Returns a rendered icon element for the given filename. */
export function renderFileIcon(filename: string, className?: string): ReactElement {
  let icon = DEFAULT_FILE_ICON;

  if (FILENAME_ICON_MAP[filename]) {
    icon = FILENAME_ICON_MAP[filename];
  } else {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex >= 0) {
      const ext = filename.slice(dotIndex);
      if (EXTENSION_ICON_MAP[ext]) {
        icon = EXTENSION_ICON_MAP[ext];
      }
    }
  }

  return createElement(icon, { className, size: 14 });
}

/** Check if a filename is an infrastructure file that needs a warning before modification. */
export function isInfrastructureFile(filename: string): boolean {
  if (INFRASTRUCTURE_FILE_PATTERNS.includes(filename)) {
    return true;
  }
  return INFRASTRUCTURE_FILE_PREFIXES.some(prefix => filename.startsWith(prefix));
}
