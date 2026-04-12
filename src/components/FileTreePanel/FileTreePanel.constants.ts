import {
  File as FileIcon,
  FileCode as FileCodeIcon,
  FileJson as FileJsonIcon,
  FileText as FileTextIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Database as DatabaseIcon,
  Globe as GlobeIcon,
  Package as PackageIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const EXTENSION_ICON_MAP: Record<string, LucideIcon> = {
  '.ts': FileCodeIcon,
  '.tsx': FileCodeIcon,
  '.js': FileCodeIcon,
  '.jsx': FileCodeIcon,
  '.mjs': FileCodeIcon,
  '.cjs': FileCodeIcon,
  '.json': FileJsonIcon,
  '.md': FileTextIcon,
  '.txt': FileTextIcon,
  '.css': FileCodeIcon,
  '.scss': FileCodeIcon,
  '.html': GlobeIcon,
  '.htm': GlobeIcon,
  '.svg': ImageIcon,
  '.png': ImageIcon,
  '.jpg': ImageIcon,
  '.jpeg': ImageIcon,
  '.gif': ImageIcon,
  '.webp': ImageIcon,
  '.ico': ImageIcon,
  '.yml': SettingsIcon,
  '.yaml': SettingsIcon,
  '.toml': SettingsIcon,
  '.env': SettingsIcon,
  '.sql': DatabaseIcon,
  '.prisma': DatabaseIcon,
};

export const FILENAME_ICON_MAP: Record<string, LucideIcon> = {
  'package.json': PackageIcon,
  'tsconfig.json': SettingsIcon,
  'Dockerfile': SettingsIcon,
  'docker-compose.yml': SettingsIcon,
  '.gitignore': SettingsIcon,
  '.eslintrc.json': SettingsIcon,
};

export const DEFAULT_FILE_ICON = FileIcon;

/** File patterns that trigger infrastructure warning dialogs when modified/deleted/renamed. */
export const INFRASTRUCTURE_FILE_PATTERNS = [
  'docker-compose.yml',
  'docker-compose.yaml',
  '.env',
];

/** File name prefixes that trigger infrastructure warnings. */
export const INFRASTRUCTURE_FILE_PREFIXES = [
  'Dockerfile',
];
