'use client';

import Link from 'next/link';
import type { ApiProject } from '@/types/api';
import { Button } from '@/components/ui/button/button';
import Heading from '@/components/ui/heading/Heading';
import { Play as PlayIcon, Square as StopIcon, Trash2 as TrashIcon } from 'lucide-react';
import './ProjectCard.css';

interface ProjectCardProps {
  project: ApiProject;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  created: 'Created',
  starting: 'Starting',
  running: 'Running',
  stopped: 'Stopped',
  error: 'Error',
};

export default function ProjectCard({ project, onStart, onStop, onDelete }: ProjectCardProps) {
  const isRunning = project.status === 'running';
  const isStarting = project.status === 'starting';

  function handleStartClick() {
    onStart(project.id);
  }

  function handleStopClick() {
    onStop(project.id);
  }

  function handleDeleteClick() {
    onDelete(project.id);
  }

  return (
    <article className="project-card">
      <div className="project-card-header">
        <Link href={`/project/${project.id}`} className="project-card-name-link">
          <Heading as="h3" size="sm">{project.name}</Heading>
        </Link>
        <span className={`project-card-status project-card-status--${project.status}`}>
          {STATUS_LABELS[project.status] ?? project.status}
        </span>
      </div>

      <p className="project-card-slug">{project.previewUrl}</p>

      <time className="project-card-date">
        Created {new Date(project.createdAt).toLocaleDateString()}
      </time>

      <div className="project-card-actions">
        {isRunning ? (
          <Button variant="outline" size="sm" onClick={handleStopClick}>
            <StopIcon /> Stop
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={handleStartClick} disabled={isStarting}>
            <PlayIcon /> Start
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleDeleteClick}>
          <TrashIcon />
        </Button>
      </div>
    </article>
  );
}
