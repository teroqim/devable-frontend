'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  fetchChatSessionsAsync,
  createChatSessionAsync,
  fetchChatMessagesAsync,
  sendChatMessageAsync,
  cancelChatMessageAsync,
} from '@/lib/api-client';
import type {
  ApiChatMessage,
  ApiChatSession,
  ApiImageAttachment,
  ApiProject,
  ChatStreamEvent,
} from '@/types/api';
import { useProjectEditor } from '@/contexts/ProjectEditorContext';
import type { DisplayMessage } from './ChatPanel.types';
import { apiMessageToDisplayMessage } from './ChatPanel.utils';
import ChatMessage from './ChatMessage/ChatMessage';
import ChatInput from './ChatInput/ChatInput';
import SessionSelector from './SessionSelector/SessionSelector';
import CostDisplay from './CostDisplay/CostDisplay';
import './ChatPanel.css';

interface ChatPanelProps {
  project: ApiProject;
}

export default function ChatPanel({ project }: ChatPanelProps) {
  const { getToken } = useAuth();
  const { setIsAgentStreaming, notifyAgentFileChange } = useProjectEditor();
  const [sessions, setSessions] = useState<ApiChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const skipNextMessageFetchRef = useRef(false);

  useEffect(() => {
    async function loadAsync() {
      const result = await fetchChatSessionsAsync(getToken, project.id);
      if (result.success && result.data.length > 0) {
        setSessions(result.data);
        setCurrentSessionId(result.data[0].id);
      }
    }
    loadAsync();
  }, [getToken, project.id]);

  useEffect(() => {
    if (!currentSessionId) {
      return;
    }

    // Skip fetch when we just created a new session — messages are already in local state
    // and the DB might not have the assistant message yet (race with SSE stream)
    if (skipNextMessageFetchRef.current) {
      skipNextMessageFetchRef.current = false;
      return;
    }

    async function loadMessagesAsync() {
      const result = await fetchChatMessagesAsync(getToken, project.id, currentSessionId!);
      if (result.success) {
        const loaded = result.data.map(apiMessageToDisplayMessage);
        setMessages(loaded);

        let total = 0;
        result.data.forEach((m: ApiChatMessage) => {
          if (m.cost) {
            total += m.cost;
          }
        });
        setSessionCost(total);
      }
    }
    loadMessagesAsync();
  }, [getToken, project.id, currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string, images?: ApiImageAttachment[]) => {
    let sessionId = currentSessionId;

    if (!sessionId) {
      const createResult = await createChatSessionAsync(getToken, project.id);
      if (!createResult.success) {
        console.error('Failed to create session:', createResult.error);
        return;
      }
      sessionId = createResult.data.id;
      skipNextMessageFetchRef.current = true;
      setCurrentSessionId(sessionId);
      setSessions((prev) => [createResult.data, ...prev]);
    }

    const assistantId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        contentBlocks: [{ type: 'text', text }],
        images,
      },
      {
        id: assistantId,
        role: 'assistant',
        contentBlocks: [],
        isStreaming: true,
        streamStartedAt: Date.now(),
      },
    ]);
    setIsStreaming(true);
    setIsAgentStreaming(true);

    function handleStreamEvent(event: ChatStreamEvent) {
      let shouldNotifyFileChange = false;
      let costToAdd: number | undefined;

      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === assistantId);
        if (idx === -1) {
          return prev;
        }

        const updated = [...prev];
        const msg = { ...updated[idx], contentBlocks: [...updated[idx].contentBlocks] };

        if (event.type === 'text_delta') {
          const lastBlock = msg.contentBlocks[msg.contentBlocks.length - 1];
          if (lastBlock && lastBlock.type === 'text') {
            msg.contentBlocks[msg.contentBlocks.length - 1] = {
              ...lastBlock,
              text: lastBlock.text + event.text,
            };
          } else {
            msg.contentBlocks.push({ type: 'text', text: event.text });
          }
        } else if (event.type === 'tool_use_start') {
          msg.contentBlocks.push({
            type: 'tool_use',
            tool: event.tool,
            id: event.id,
            input: event.input,
            isComplete: false,
          });
          // Don't notify on tool_use_start — the file hasn't been written yet.
          // File change notification happens on tool_use_end and result events.
        } else if (event.type === 'tool_use_end') {
          msg.contentBlocks = msg.contentBlocks.map((b) =>
            b.type === 'tool_use' && b.id === event.id
              ? { ...b, output: event.output, isComplete: true }
              : b,
          );
          // Notify after tool completes — the file has been written by now
          if (event.tool.includes('write') || event.tool.includes('edit') || event.tool.includes('exec_command')) {
            shouldNotifyFileChange = true;
          }
        } else if (event.type === 'result') {
          msg.isStreaming = false;
          msg.usage = event.usage;
          msg.cost = event.cost;
          if (msg.streamStartedAt) {
            msg.elapsedSeconds = Math.round((Date.now() - msg.streamStartedAt) / 1000);
          }
          costToAdd = event.cost;
          shouldNotifyFileChange = true;
        } else if (event.type === 'error') {
          msg.contentBlocks.push({ type: 'text', text: `\n\n**Error:** ${event.message}` });
          msg.isStreaming = false;
        }

        updated[idx] = msg;
        return updated;
      });

      // Update context state outside the setMessages updater to avoid
      // "Cannot update component while rendering a different component" React error
      if (shouldNotifyFileChange) {
        notifyAgentFileChange();
      }
      if (costToAdd) {
        setSessionCost((prev) => prev + costToAdd!);
      }
    }

    await sendChatMessageAsync(getToken, project.id, sessionId, text, images, handleStreamEvent);
    setIsStreaming(false);
    setIsAgentStreaming(false);
  }, [currentSessionId, getToken, project.id, setIsAgentStreaming, notifyAgentFileChange]);

  function handleSessionChange(sessionId: string) {
    setCurrentSessionId(sessionId);
  }

  async function handleNewSession() {
    const result = await createChatSessionAsync(getToken, project.id);
    if (result.success) {
      setSessions((prev) => [result.data, ...prev]);
      setCurrentSessionId(result.data.id);
      setMessages([]);
      setSessionCost(0);
    }
  }

  async function handleCancel() {
    if (!currentSessionId) {
      return;
    }
    await cancelChatMessageAsync(getToken, project.id, currentSessionId);
  }

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <SessionSelector
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSessionChange={handleSessionChange}
          onNewSession={handleNewSession}
        />
        <CostDisplay cost={sessionCost} />
      </div>
      <div className="chat-panel-messages">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSend={handleSendMessage}
        onCancel={handleCancel}
        isStreaming={isStreaming}
        disabled={project.status !== 'running'}
      />
    </div>
  );
}
