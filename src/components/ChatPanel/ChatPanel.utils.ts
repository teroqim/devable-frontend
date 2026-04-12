import type { ApiChatMessage, ApiTokenUsage } from '@/types/api';
import type { ContentBlock, DisplayMessage } from './ChatPanel.types';

/** Convert a stored API message (with separate content + toolUses) to the content blocks model. */
export function apiMessageToDisplayMessage(m: ApiChatMessage): DisplayMessage {
  const blocks: ContentBlock[] = [];

  if (m.content) {
    blocks.push({ type: 'text', text: m.content });
  }

  const toolUses = m.toolUses as Array<{ tool: string; id: string; input?: unknown; output?: string }> | undefined;
  if (toolUses) {
    toolUses.forEach(t => {
      blocks.push({ type: 'tool_use', tool: t.tool, id: t.id, input: t.input, output: t.output, isComplete: true });
    });
  }

  return {
    id: m.id,
    role: m.role as 'user' | 'assistant',
    contentBlocks: blocks,
    images: m.images,
    usage: m.usage as ApiTokenUsage | undefined,
    cost: m.cost,
  };
}
