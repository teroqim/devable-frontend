import ProjectEditorPage from '@/components/pages/ProjectEditorPage/ProjectEditorPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ProjectEditorPage paramsPromise={params} />;
}
