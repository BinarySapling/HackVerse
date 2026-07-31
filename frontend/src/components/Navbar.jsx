import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import BrandLogo from './BrandLogo';
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    `px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-white' : 'text-muted hover:text-secondary'
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0c0b10]/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
        <BrandLogo size="md" />

        <nav className="hidden md:flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/hackathons" className={navLinkClass}>
            Hackathons
          </NavLink>
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
              <Link to="/login" className="text-sm text-muted hover:text-secondary transition-colors px-2">
                Login
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-secondary hover:bg-white/10"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0c0b10]/95 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2 text-sm font-medium">
            <NavLink to="/" end className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/hackathons" className={navLinkClass} onClick={() => setIsMenuOpen(false)}>
              Hackathons
            </NavLink>
            <div className="pt-3 flex flex-col gap-2">
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
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Get Started
                    </Button>
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
