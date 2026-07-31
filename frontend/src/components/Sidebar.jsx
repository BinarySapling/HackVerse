import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Trophy,
  ClipboardCheck,
  User,
  LogOut,
  FolderOpen
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  // Sidebar Items depending on Role
  const roleLinks = {
    admin: [
      { to: `/dashboard/admin`, label: 'Dashboard', icon: LayoutDashboard },
      { to: `/organizer/hackathons`, label: 'All Hackathons', icon: Trophy },
      { to: `/profile`, label: 'My Profile', icon: User },
    ],
    organizer: [
      { to: `/dashboard/organizer`, label: 'Dashboard', icon: LayoutDashboard },
      { to: `/organizer/hackathons`, label: 'Hackathons', icon: Trophy },
      { to: `/profile`, label: 'My Profile', icon: User },
    ],
    participant: [
      { to: `/dashboard/participant`, label: 'Dashboard', icon: LayoutDashboard },
      { to: `/registrations/me`, label: 'My Registrations', icon: FolderOpen },
      { to: `/profile`, label: 'My Profile', icon: User },
    ],
    judge: [
      { to: `/dashboard/judge`, label: 'Dashboard', icon: LayoutDashboard },
      { to: `/judge/hackathons`, label: 'Assigned Events', icon: ClipboardCheck },
      { to: `/profile`, label: 'My Profile', icon: User },
    ],
  };

  const links = roleLinks[user.role] || [];

  return (
    <aside
      className={`h-screen bg-surfaceDark text-white flex flex-col justify-between border-r border-slate-700 transition-all duration-300 z-30 select-none shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-slate-700 gap-2">
          {!isCollapsed ? (
            <BrandLogo to={`/dashboard/${user.role}`} size="sm" imgClassName="max-w-[140px]" />
          ) : (
            <BrandLogo to={`/dashboard/${user.role}`} size="sm" imgClassName="h-9 w-9" />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-300 hover:text-white transition-colors focus:outline-none hidden md:block rounded-md shrink-0"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* User Info card (Shortened if collapsed) */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
            {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-slate-300 capitalize truncate">
                {user.role} Dashboard
              </p>
            </div>
          )}
        </div>

        {/* Links */}
        <nav className="flex flex-col gap-1 p-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout / Footer */}
      <div className="p-2 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-red-300 hover:bg-slate-700 hover:text-white transition-colors focus:outline-none"
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
