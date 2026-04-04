'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { Button } from '@/components/ui/button/button';
import Heading from '@/components/ui/heading/Heading';
import { TEMPLATES, THEMES, TEMPLATES_WITHOUT_THEMES } from './CreateProjectDialog.constants';
import './CreateProjectDialog.css';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, template?: string, designTheme?: string) => void;
  loading: boolean;
}

export default function CreateProjectDialog({ open, onClose, onCreate, loading }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('nextjs-ts');
  const [designTheme, setDesignTheme] = useState('clean');

  if (!open) return null;

  const showThemes = !TEMPLATES_WITHOUT_THEMES.has(template);

  function resetForm() {
    setName('');
    setTemplate('nextjs-ts');
    setDesignTheme('clean');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), template, showThemes ? designTheme : undefined);
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }

  function handleTemplateSelect(value: string) {
    setTemplate(value);
  }

  function handleThemeSelect(value: string) {
    setDesignTheme(value);
  }

  function handleOverlayClick() {
    resetForm();
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
            <span className="dialog-label">Template</span>
            <div className="dialog-card-grid">
              {TEMPLATES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={clsx('dialog-card', template === t.value && 'dialog-card--selected')}
                  onClick={() => handleTemplateSelect(t.value)}
                >
                  <span className="dialog-card-label">{t.label}</span>
                  <span className="dialog-card-description">{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          {showThemes && (
            <div className="dialog-field">
              <span className="dialog-label">Design theme</span>
              <div className="dialog-theme-grid">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={clsx('dialog-theme-card', designTheme === t.value && 'dialog-theme-card--selected')}
                    onClick={() => handleThemeSelect(t.value)}
                  >
                    <Image
                      src={t.preview}
                      alt={`${t.label} theme preview`}
                      width={120}
                      height={80}
                      className="dialog-theme-preview"
                    />
                    <span className="dialog-theme-label">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="dialog-actions">
            <Button variant="outline" type="button" onClick={handleOverlayClick} disabled={loading}>
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
