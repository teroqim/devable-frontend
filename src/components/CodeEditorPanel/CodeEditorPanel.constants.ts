/** Maps file extensions to Monaco editor language identifiers. */
export const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.json': 'json',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.md': 'markdown',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.sql': 'sql',
  '.sh': 'shell',
  '.bash': 'shell',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.dockerfile': 'dockerfile',
  '.prisma': 'graphql',
};

/** Filenames that map to specific languages regardless of extension. */
export const FILENAME_LANGUAGE_MAP: Record<string, string> = {
  'Dockerfile': 'dockerfile',
  'Dockerfile.workspace': 'dockerfile',
  'Makefile': 'shell',
  '.gitignore': 'plaintext',
  '.env': 'plaintext',
  '.env.local': 'plaintext',
};
