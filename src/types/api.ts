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

export interface ApiProjectContainer {
  id: string;
  name: string;
  type: string;
  status: string;
  port: number | null;
}

export interface ApiProject {
  id: string;
  name: string;
  slug: string;
  userId: string;
  status: 'created' | 'starting' | 'running' | 'stopped' | 'error';
  previewUrl: string;
  createdAt: string;
  updatedAt: string;
  containers?: ApiProjectContainer[];
}

export interface CreateProjectBody {
  name: string;
  template?: string;
  designTheme?: string;
}

export interface UpdateProjectBody {
  name?: string;
}
