import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-secondary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="w-full bg-white border-t border-border py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} HackVerse. All rights reserved. Built for Major Project and interview presentation.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
