import { proxyToBackend } from '@/lib/api-proxy';

export async function GET(request: Request) {
  return proxyToBackend(request, '/v1/projects');
}

export async function POST(request: Request) {
  return proxyToBackend(request, '/v1/projects');
}
