'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { fetchAnnouncements } from '@/lib/api-client';
import type { ApiAnnouncement } from '@/types/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const { getToken, isLoaded } = useAuth();
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnnouncements() {
      if (!isLoaded) return;

      setLoading(true);
      try {
        const data = await fetchAnnouncements(getToken);
        setAnnouncements(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load announcements',
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, [isLoaded, getToken]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-loading">Loading announcements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Announcements</h1>
      <div className="dashboard-announcements">
        {announcements.length === 0 ? (
          <p className="dashboard-empty">No announcements yet.</p>
        ) : (
          announcements.map(announcement => (
            <article
              key={announcement.id}
              className="announcement-card"
            >
              <h2 className="announcement-title">{announcement.title}</h2>
              <p className="announcement-content">{announcement.content}</p>
              <time className="announcement-date">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </time>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
