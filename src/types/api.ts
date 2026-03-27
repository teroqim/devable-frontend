export interface ApiAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: unknown;
}
