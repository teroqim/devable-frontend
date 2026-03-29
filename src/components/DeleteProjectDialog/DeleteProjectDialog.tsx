'use client';

import { Button } from '@/components/ui/button/button';
import Heading from '@/components/ui/heading/Heading';
import './DeleteProjectDialog.css';

interface DeleteProjectDialogProps {
  open: boolean;
  projectName: string;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteProjectDialog({
  open,
  projectName,
  onClose,
  onConfirm,
  loading,
}: DeleteProjectDialogProps) {
  if (!open) return null;

  function handleOverlayClick() {
    onClose();
  }

  function handleContentClick(e: React.MouseEvent) {
    e.stopPropagation();
  }

  return (
    <div className="delete-dialog-overlay" onClick={handleOverlayClick}>
      <div className="delete-dialog-content" onClick={handleContentClick}>
        <Heading as="h2" size="md">Delete project</Heading>
        <p className="delete-dialog-message">
          Are you sure you want to delete <strong>{projectName}</strong>?
          All files and containers will be permanently removed.
        </p>
        <div className="delete-dialog-actions">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
