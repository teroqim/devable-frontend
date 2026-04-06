'use client';

import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ApiTokenUsage } from '@/types/api';
import ToolUseIndicator from '../ToolUseIndicator/ToolUseIndicator';
import CostDisplay from '../CostDisplay/CostDisplay';
import './ChatMessage.css';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: unknown;
  toolUses?: Array<{ tool: string; id: string; input?: unknown; output?: string }>;
  usage?: ApiTokenUsage;
  cost?: number | null;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: DisplayMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('chat-message', isUser ? 'chat-message--user' : 'chat-message--assistant')}>
      <div className="chat-message-label">{isUser ? 'You' : 'Assistant'}</div>
      <div className="chat-message-content">
        {isUser ? (
          <p className="chat-message-text">{message.content}</p>
        ) : (
          <div className="chat-message-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
        {message.toolUses && message.toolUses.length > 0 && (
          <div className="chat-message-tools">
            {message.toolUses.map((tool) => (
              <ToolUseIndicator key={tool.id} tool={tool} />
            ))}
          </div>
        )}
        {message.isStreaming && (
          <span className="chat-message-streaming">...</span>
        )}
      </div>
      {!isUser && message.cost != null && (
        <div className="chat-message-footer">
          <CostDisplay cost={message.cost} usage={message.usage} compact />
        </div>
      )}
    </div>
  );
}
