import { proxyToBackend } from '@/lib/api-proxy';

export async function GET(request: Request) {
  return proxyToBackend(request, '/v1/announcements');
}
