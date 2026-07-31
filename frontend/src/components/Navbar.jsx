import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import BrandLogo from './BrandLogo';
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    setIsMenuOpen(false);
    if (!user) return navigate('/login');
    navigate(`/dashboard/${user.role}`);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 transition-colors ${
      isActive
        ? 'bg-hoverSurface text-primary'
        : 'text-slate-600 hover:bg-hoverSurface hover:text-primary'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo size="md" />

        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/hackathons" className={navLinkClass}>Hackathons</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="secondary" size="sm" onClick={handleDashboardRedirect} className="gap-1.5">
                <LayoutDashboard size={16} />
                Dashboard
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-secondary hover:bg-hoverSurface"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-sm font-medium">
            <NavLink to="/" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/hackathons" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>Hackathons</NavLink>
            <div className="pt-2 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="secondary" size="sm" onClick={handleDashboardRedirect} className="w-full gap-1.5">
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="w-full gap-1.5">
                    <LogOut size={16} />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="secondary" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
