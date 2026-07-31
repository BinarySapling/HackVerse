import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import NotificationsBell from './NotificationsBell';
import { LogOut, Menu, X } from 'lucide-react';
import { resolveAssetUrl } from '../utils/assetUrl';

const ConsoleNavbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!user) return null;

  const roleLinks = {
    admin: [
      { to: '/dashboard/admin', label: 'Overview', end: true },
      { to: '/organizer/hackathons', label: 'Hackathons' },
      { to: '/profile', label: 'Profile' },
    ],
    organizer: [
      { to: '/dashboard/organizer', label: 'Overview', end: true },
      { to: '/organizer/hackathons', label: 'Hackathons' },
      { to: '/profile', label: 'Profile' },
    ],
    participant: [
      { to: '/dashboard/participant', label: 'Overview', end: true },
      { to: '/registrations/me', label: 'Registrations' },
      { to: '/hackathons', label: 'Explore' },
      { to: '/profile', label: 'Profile' },
    ],
    judge: [
      { to: '/dashboard/judge', label: 'Overview', end: true },
      { to: '/judge/hackathons', label: 'Assigned' },
      { to: '/profile', label: 'Profile' },
    ],
  };

  const links = roleLinks[user.role] || [];

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-white' : 'text-muted hover:text-secondary'
    }`;

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header
      className={`sticky top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-[#09090B]/70 backdrop-blur-xl border-white/5'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-5 lg:px-6 flex items-center justify-between py-3 gap-6">
        <BrandLogo to={`/dashboard/${user.role}`} size="md" />

        <nav className="hidden md:flex items-center gap-0.5 rounded-full bg-white/[0.03] ring-1 ring-white/[0.06] px-1.5 py-1">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <NotificationsBell />
          <NavLink
            to="/profile"
            className="inline-flex items-center gap-2.5 text-xs text-muted hover:text-secondary transition-colors"
            title="Profile"
          >
            {user.avatar ? (
              <img
                src={resolveAssetUrl(user.avatar)}
                alt=""
                className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-primary/80 text-white inline-flex items-center justify-center text-[11px] font-semibold tracking-wide">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </span>
            )}
            <span className="capitalize">{user.firstName}</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-danger hover:bg-white/5 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-secondary hover:bg-white/5"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#09090B]/90 backdrop-blur-xl">
          <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-left text-sm font-medium text-danger"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default ConsoleNavbar;
