import React from 'react';
import { Outlet } from 'react-router-dom';
import ConsoleNavbar from '../components/ConsoleNavbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-secondary page-glow overflow-x-hidden">
      <ConsoleNavbar />
      <main className="flex-1 w-full relative">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-5 lg:px-6 py-8 sm:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
