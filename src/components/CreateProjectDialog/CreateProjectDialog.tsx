'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button/button';
import Heading from '@/components/ui/heading/Heading';
import './CreateProjectDialog.css';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, template?: string, designTheme?: string) => void;
  loading: boolean;
}

const TEMPLATES = [
  { value: '', label: 'None' },
  { value: 'nextjs-ts', label: 'Next.js + TypeScript' },
  { value: 'bun-elysia-api', label: 'Elysia API' },
  { value: 'fullstack', label: 'Full-stack' },
];

const THEMES = [
  { value: '', label: 'None' },
  { value: 'clean', label: 'Clean' },
  { value: 'bold', label: 'Bold' },
  { value: 'soft', label: 'Soft' },
];

export default function CreateProjectDialog({ open, onClose, onCreate, loading }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('');
  const [designTheme, setDesignTheme] = useState('');

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(
      name.trim(),
      template || undefined,
      designTheme || undefined,
    );
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleTemplateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTemplate(e.target.value);
  }

  function handleThemeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setDesignTheme(e.target.value);
  }

  function handleOverlayClick() {
    onClose();
  }

  function handleContentClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div className="dialog-content" onClick={handleContentClick}>
        <Heading as="h2" size="lg">New Project</Heading>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <div className="dialog-field">
            <label className="dialog-label" htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              className="dialog-input"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="My awesome project"
              autoFocus
              required
            />
          </div>

          <div className="dialog-field">
            <label className="dialog-label" htmlFor="project-template">Template (optional)</label>
            <select id="project-template" className="dialog-select" value={template} onChange={handleTemplateChange}>
              {TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="dialog-field">
            <label className="dialog-label" htmlFor="project-theme">Design theme (optional)</label>
            <select id="project-theme" className="dialog-select" value={designTheme} onChange={handleThemeChange}>
              {THEMES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="dialog-actions">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
