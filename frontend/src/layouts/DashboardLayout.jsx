import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const location = useLocation();

  // Helper to construct breadcrumbs or simple title from pathname
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/admin')) return 'Admin Center';
    if (path.includes('/dashboard/organizer')) return 'Organizer Console';
    if (path.includes('/dashboard/participant')) return 'Participant Arena';
    if (path.includes('/dashboard/judge')) return 'Judge Assessment Panel';
    if (path.includes('/organizer/hackathons')) return 'Hackathons';
    if (path.includes('/hackathons/create')) return 'Launch Hackathon';
    if (path.includes('/hackathons/edit')) return 'Edit Hackathon Details';
    if (path.includes('/registrations/me')) return 'My Event Registrations';
    if (path.includes('/profile')) return 'My Profile';
    return 'HackVerse Dashboard';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-secondary">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Dashboard container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header/Navigation bar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          <div>
            <h1 className="text-base font-semibold text-secondary">
              {getHeaderTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <span className="text-xs text-slate-400 block leading-none">System Active</span>
              </div>
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>
          </div>
        </header>

        {/* Dashboard Pages Scroll container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
