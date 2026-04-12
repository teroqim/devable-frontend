import type { ApiTokenUsage } from '@/types/api';

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; tool: string; id: string; input?: unknown; output?: string; isComplete?: boolean };

export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  contentBlocks: ContentBlock[];
  images?: unknown;
  usage?: ApiTokenUsage;
  cost?: number | null;
  isStreaming?: boolean;
  /** Timestamp when streaming started (used by ElapsedTimer). */
  streamStartedAt?: number;
  /** Final elapsed time in seconds (persists after streaming ends). */
  elapsedSeconds?: number;
}
