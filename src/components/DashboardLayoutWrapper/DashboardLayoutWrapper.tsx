'use client';

import Navbar from '@/components/Navbar/Navbar';
import Header from '@/components/Header/Header';
import './DashboardLayoutWrapper.css';

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  return (
    <div className="dashboard-body">
      <Navbar />
      <div className="dashboard-main-wrapper">
        <Header />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
