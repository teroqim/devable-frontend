'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button/button';
import { Send as SendIcon, X as XIcon, Paperclip as PaperclipIcon } from 'lucide-react';
import type { ApiImageAttachment } from '@/types/api';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string, images?: ApiImageAttachment[]) => void;
  onCancel: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export default function ChatInput({ onSend, onCancel, isStreaming, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [images, setImages] = useState<ApiImageAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed && images.length === 0) return;
    onSend(trimmed, images.length > 0 ? images : undefined);
    setText('');
    setImages([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value);
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }

  function handleFileClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const mediaType = file.type as ApiImageAttachment['mediaType'];
        setImages((prev) => [...prev, { mediaType, base64 }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }

  function handleRemoveImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          const mediaType = file.type as ApiImageAttachment['mediaType'];
          setImages((prev) => [...prev, { mediaType, base64 }]);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  if (isStreaming) {
    return (
      <div className="chat-input-container">
        <Button variant="destructive" size="sm" onClick={onCancel}>
          <XIcon size={14} />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="chat-input-container">
      {images.length > 0 && (
        <div className="chat-input-images">
          {images.map((img, i) => (
            <div key={i} className="chat-input-image-preview">
              <img src={`data:${img.mediaType};base64,${img.base64}`} alt="attachment" />
              <button className="chat-input-image-remove" onClick={() => handleRemoveImage(i)}>
                <XIcon size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="chat-input-row">
        <button className="chat-input-attach" onClick={handleFileClick} disabled={disabled}>
          <PaperclipIcon size={16} />
        </button>
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={disabled ? 'Start the project to chat...' : 'Type a message...'}
          disabled={disabled}
          rows={1}
        />
        <Button size="sm" onClick={handleSubmit} disabled={disabled || (!text.trim() && images.length === 0)}>
          <SendIcon size={14} />
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        multiple
        onChange={handleFileChange}
        hidden
      />
    </div>
  );
}
