'use client';

import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { DisplayMessage } from '../ChatPanel.types';
import ToolUseIndicator from '../ToolUseIndicator/ToolUseIndicator';
import CostDisplay from '../CostDisplay/CostDisplay';
import ElapsedTimer from '../ElapsedTimer/ElapsedTimer';
import './ChatMessage.css';

function formatElapsed(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
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
        {message.contentBlocks.map((block, index) => {
          if (block.type === 'text') {
            if (isUser) {
              return <p key={index} className="chat-message-text">{block.text}</p>;
            }
            return (
              <div key={index} className="chat-message-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.text}</ReactMarkdown>
              </div>
            );
          }
          if (block.type === 'tool_use') {
            return <ToolUseIndicator key={block.id} tool={block} />;
          }
          return null;
        })}
        {message.isStreaming && (
          <span className="chat-message-streaming">...</span>
        )}
      </div>
      {!isUser && (
        <div className="chat-message-footer">
          {message.isStreaming && (
            <ElapsedTimer isRunning />
          )}
          {!message.isStreaming && message.elapsedSeconds != null && (
            <span className="chat-message-elapsed">{formatElapsed(message.elapsedSeconds)}</span>
          )}
          {!message.isStreaming && message.cost != null && (
            <CostDisplay cost={message.cost} usage={message.usage} compact />
          )}
        </div>
      )}
    </div>
  );
}
