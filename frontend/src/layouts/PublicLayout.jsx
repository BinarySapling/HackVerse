import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BrandLogo from '../components/BrandLogo';

const PublicLayout = () => {
  const { pathname } = useLocation();
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(pathname);
  const isHome = pathname === '/';
  const isHackathonDetail =
    /^\/hackathons\/[^/]+$/.test(pathname) && pathname !== '/hackathons';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background text-secondary page-glow">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-secondary page-glow">
      <Navbar />

      <main
        className={`flex-1 w-full ${
          isHome || isHackathonDetail
            ? ''
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10'
        }`}
      >
        <Outlet />
      </main>

      <footer className="relative z-20 w-full bg-[#0a090e] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <BrandLogo size="md" />
              <p className="text-sm text-muted leading-relaxed max-w-sm">
                The student-friendly platform to launch, join, and judge hackathons end to end.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Explore</p>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/" className="text-secondary/90 hover:text-primary-soft transition-colors">
                  Home
                </Link>
                <Link to="/hackathons" className="text-secondary/90 hover:text-primary-soft transition-colors">
                  Hackathons
                </Link>
                <Link to="/signup" className="text-secondary/90 hover:text-primary-soft transition-colors">
                  Create account
                </Link>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Account</p>
              <div className="flex flex-col gap-2 text-sm">
                <Link to="/login" className="text-secondary/90 hover:text-primary-soft transition-colors">
                  Login
                </Link>
                <Link to="/forgot-password" className="text-secondary/90 hover:text-primary-soft transition-colors">
                  Reset password
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
            <p>&copy; {new Date().getFullYear()} HackVerse. Built for the future of building.</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted/70">SYS_ACTIVE</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
