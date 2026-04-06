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
  ApiTokenUsage,
  ChatStreamEvent,
} from '@/types/api';
import ChatMessage from './ChatMessage/ChatMessage';
import ChatInput from './ChatInput/ChatInput';
import SessionSelector from './SessionSelector/SessionSelector';
import CostDisplay from './CostDisplay/CostDisplay';
import './ChatPanel.css';

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

interface ChatPanelProps {
  project: ApiProject;
}

export default function ChatPanel({ project }: ChatPanelProps) {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<ApiChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (!currentSessionId) return;

    async function loadMessagesAsync() {
      const result = await fetchChatMessagesAsync(getToken, project.id, currentSessionId!);
      if (result.success) {
        const loaded: DisplayMessage[] = result.data.map((m: ApiChatMessage) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          images: m.images,
          toolUses: m.toolUses as DisplayMessage['toolUses'],
          usage: m.usage as ApiTokenUsage | undefined,
          cost: m.cost,
        }));
        setMessages(loaded);

        let total = 0;
        result.data.forEach((m: ApiChatMessage) => {
          if (m.cost) total += m.cost;
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
      setCurrentSessionId(sessionId);
      setSessions((prev) => [createResult.data, ...prev]);
    }

    const assistantId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text, images },
      { id: assistantId, role: 'assistant', content: '', isStreaming: true, toolUses: [] },
    ]);
    setIsStreaming(true);

    function handleStreamEvent(event: ChatStreamEvent) {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === assistantId);
        if (idx === -1) return prev;

        const updated = [...prev];
        const msg = { ...updated[idx] };

        if (event.type === 'text_delta') {
          msg.content += event.text;
        } else if (event.type === 'tool_use_start') {
          msg.toolUses = [...(msg.toolUses ?? []), { tool: event.tool, id: event.id, input: event.input }];
        } else if (event.type === 'tool_use_end') {
          msg.toolUses = (msg.toolUses ?? []).map((t) =>
            t.id === event.id ? { ...t, output: event.output } : t,
          );
        } else if (event.type === 'result') {
          msg.isStreaming = false;
          msg.usage = event.usage;
          msg.cost = event.cost;
          if (event.cost) {
            setSessionCost((prev) => prev + event.cost!);
          }
        } else if (event.type === 'error') {
          msg.content += `\n\n**Error:** ${event.message}`;
          msg.isStreaming = false;
        }

        updated[idx] = msg;
        return updated;
      });
    }

    await sendChatMessageAsync(getToken, project.id, sessionId, text, images, handleStreamEvent);
    setIsStreaming(false);
  }, [currentSessionId, getToken, project.id]);

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
    if (!currentSessionId) return;
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
