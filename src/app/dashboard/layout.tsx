import './layout.css';
import DashboardLayoutWrapper from '@/components/DashboardLayoutWrapper/DashboardLayoutWrapper';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
