import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import {
  LayoutDashboard,
  Trophy,
  ClipboardCheck,
  User,
  LogOut,
  FolderOpen,
  PlusCircle,
  X,
} from 'lucide-react';

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleLinks = {
    admin: [
      { to: `/dashboard/admin`, label: 'Overview', icon: LayoutDashboard },
      { to: `/organizer/hackathons`, label: 'Hackathons', icon: Trophy },
      { to: `/profile`, label: 'Profile', icon: User },
    ],
    organizer: [
      { to: `/dashboard/organizer`, label: 'Overview', icon: LayoutDashboard },
      { to: `/organizer/hackathons`, label: 'Hackathons', icon: Trophy },
      { to: `/hackathons/create`, label: 'Create', icon: PlusCircle },
      { to: `/profile`, label: 'Profile', icon: User },
    ],
    participant: [
      { to: `/dashboard/participant`, label: 'Overview', icon: LayoutDashboard },
      { to: `/registrations/me`, label: 'Registrations', icon: FolderOpen },
      { to: `/profile`, label: 'Profile', icon: User },
    ],
    judge: [
      { to: `/dashboard/judge`, label: 'Overview', icon: LayoutDashboard },
      { to: `/judge/hackathons`, label: 'Assigned', icon: ClipboardCheck },
      { to: `/profile`, label: 'Profile', icon: User },
    ],
  };

  const links = roleLinks[user.role] || [];

  const navContent = (
    <>
      <div className="px-5 pt-5 pb-4">
        <BrandLogo to={`/dashboard/${user.role}`} size="sm" showText />
        <p className="mt-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
          {user.role} console
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to.includes('/dashboard/')}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted hover:text-secondary hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} className="shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="rounded-2xl bg-white/[0.03] px-3 py-3 mb-3">
          <p className="text-sm font-semibold truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-muted hover:text-danger hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex w-60 h-screen shrink-0 flex-col bg-[#0c0a12] border-r border-white/5">
        {navContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 flex flex-col bg-[#0c0a12] border-r border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-secondary"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
