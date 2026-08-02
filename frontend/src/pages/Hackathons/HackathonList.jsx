import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import { getApiList } from '../../utils/apiResponse';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ArrowRight, Plus, Trophy, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'registration_open', label: 'Open' },
  { id: 'ongoing', label: 'Live' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
  { id: 'completed', label: 'Completed' },
];

const MODE_FILTERS = [
  { id: 'all', label: 'Any mode' },
  { id: 'online', label: 'Online' },
  { id: 'offline', label: 'Offline' },
  { id: 'hybrid', label: 'Hybrid' },
];

const formatStatus = (status) => (status || '').replaceAll('_', ' ');

const HackathonList = () => {
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [togglingId, setTogglingId] = useState(null);
  const [modeFilter, setModeFilter] = useState('all');
  const [themeFilter, setThemeFilter] = useState('all');
  const { user } = useAuth();
  const location = useLocation();
  const inDashboard = location.pathname.startsWith('/organizer/hackathons');
  const canManage = user?.role === 'organizer' || user?.role === 'admin';

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/hackathons', {
        params: {
          ...(inDashboard && canManage ? { includeDrafts: true } : {}),
          limit: 100,
        },
      });
      setHackathons(getApiList(response));
    } catch {
      toast.error('Failed to load hackathons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [inDashboard]);

  const handleOpenRegistration = async (id) => {
    setTogglingId(id);
    try {
      await api.post(`/hackathons/${id}/open-registration`);
      toast.success('Registration opened.');
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to open registration.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCloseRegistration = async (id) => {
    setTogglingId(id);
    try {
      await api.post(`/hackathons/${id}/close-registration`);
      toast.success('Registration closed.');
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to close registration.');
    } finally {
      setTogglingId(null);
    }
  };

  const visibleFilters = STATUS_FILTERS.filter((filter) => {
    if (filter.id === 'draft' && !inDashboard) return false;
    return true;
  });

  const themeOptions = useMemo(() => {
    const themes = hackathons
      .map((h) => h.theme?.trim())
      .filter(Boolean);
    return [...new Set(themes)].sort((a, b) => a.localeCompare(b));
  }, [hackathons]);

  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      (h.tagline || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
    const matchesMode = modeFilter === 'all' || h.mode === modeFilter;
    const matchesTheme =
      themeFilter === 'all' ||
      (h.theme || '').toLowerCase().includes(themeFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesMode && matchesTheme;
  });

  const hasActiveFilters =
    search || statusFilter !== 'all' || modeFilter !== 'all' || themeFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setModeFilter('all');
    setThemeFilter('all');
  };

  return (
    <div className="relative flex flex-col">
      <PageHeader
        eyebrow={inDashboard ? 'Manage events' : 'Explore'}
        title={inDashboard ? 'Hackathons' : 'Discover hackathons'}
        description={
          inDashboard
            ? 'Browse every event you own, jump into details, and keep drafts moving.'
            : 'Find open challenges, check timelines, and join the next build.'
        }
        actions={
          inDashboard && user?.role === 'organizer' ? (
            <Link to="/hackathons/create">
              <Button className="gap-2">
                <Plus size={16} /> Create hackathon
              </Button>
            </Link>
          ) : null
        }
      />

      <SoftDivider />

      <div className="pt-8 pb-4 flex flex-col gap-8">
        <div className="flex flex-col gap-5">
          <div className="relative max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            />
            <input
              id="search"
              type="search"
              placeholder="Search by title or tagline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-full bg-white/[0.03] text-sm text-secondary placeholder-muted/60 ring-1 ring-white/[0.08] focus:outline-none focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleFilters.map((filter) => {
              const active = statusFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    active
                      ? 'bg-primary/90 text-white shadow-[0_0_20px_rgba(124,58,237,0.25)]'
                      : 'bg-white/[0.03] text-muted hover:text-secondary ring-1 ring-white/[0.06]'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {MODE_FILTERS.map((filter) => {
                const active = modeFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setModeFilter(filter.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                      active
                        ? 'bg-primary/20 text-primary-soft ring-1 ring-primary/40'
                        : 'bg-white/[0.03] text-muted hover:text-secondary ring-1 ring-white/[0.06]'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            {themeOptions.length > 0 && (
              <select
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
                className="h-9 px-3 rounded-full bg-white/[0.03] text-xs text-secondary ring-1 ring-white/[0.08] focus:outline-none focus:ring-primary/50"
              >
                <option value="all">All themes</option>
                {themeOptions.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {isLoading ? (
          <Loader size="lg" />
        ) : filteredHackathons.length === 0 ? (
          <div className="py-16">
            <p className="text-sm text-muted">No hackathons match your filters.</p>
            {(hasActiveFilters) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm text-primary-soft hover:text-white transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <section className="flex flex-col gap-2">
            <p className="text-[11px] tracking-[0.16em] uppercase text-muted/70 mb-2">
              {filteredHackathons.length} event{filteredHackathons.length === 1 ? '' : 's'}
            </p>

            <ul className="flex flex-col">
              {filteredHackathons.map((h, index) => (
                <li key={h._id}>
                  {index > 0 && <div className="soft-row-divider" />}
                  <article className="group py-6 grid grid-cols-1 md:grid-cols-[11rem_1fr] lg:grid-cols-[11rem_1fr_auto] gap-5 items-center">
                    <div className="relative h-28 md:h-[5.5rem] overflow-hidden rounded-2xl bg-[#14101c] ring-1 ring-white/[0.06]">
                      {h.banner ? (
                        <img
                          src={resolveAssetUrl(h.banner)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-[#1a1028] to-[#09090B] flex items-center justify-center">
                          <Trophy className="text-primary-soft/70" size={24} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex flex-col gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={
                            h.status === 'ongoing'
                              ? 'success'
                              : h.status === 'registration_open' || h.status === 'published'
                                ? 'primary'
                                : 'default'
                          }
                        >
                          {formatStatus(h.status)}
                        </Badge>
                        {h.visibility && (
                          <span className="text-[10px] uppercase tracking-wider text-muted/70">
                            {h.visibility}
                          </span>
                        )}
                        {h.mode && (
                          <span className="text-[10px] uppercase tracking-wider text-muted/70">
                            {h.mode}
                          </span>
                        )}
                        {h.theme && (
                          <span className="text-[10px] tracking-wider text-muted/70">{h.theme}</span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-display font-semibold text-lg sm:text-xl tracking-tight leading-snug group-hover:text-primary-soft transition-colors">
                          {h.title}
                        </h3>
                        <p className="text-sm text-muted mt-1 line-clamp-2">
                          {h.tagline || 'No tagline set'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="opacity-70" />
                          {new Date(h.hackathonStart).toLocaleDateString()}
                          {' – '}
                          {new Date(h.hackathonEnd).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users size={13} className="opacity-70" />
                          Team {h.minTeamSize}-{h.maxTeamSize}
                        </span>
                        {h.prizePool && (
                          <span className="inline-flex items-center gap-1.5 text-primary-soft/80">
                            <Trophy size={13} />
                            {h.prizePool}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:col-span-2 lg:col-span-1 flex-wrap lg:flex-col items-start lg:items-end gap-3">
                      <Link
                        to={`/hackathons/${h.slug || h._id}`}
                        className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-primary-soft hover:text-white transition-colors"
                      >
                        View details
                        <ArrowRight
                          size={14}
                          className="group-hover/link:translate-x-0.5 transition-transform"
                        />
                      </Link>
                      {inDashboard && canManage && (
                        <div className="flex items-center gap-3 text-sm flex-wrap lg:justify-end">
                          {h.status === 'registration_open' ? (
                            <button
                              type="button"
                              disabled={togglingId === h._id}
                              onClick={() => handleCloseRegistration(h._id)}
                              className="text-muted hover:text-secondary transition-colors disabled:opacity-60"
                            >
                              Close reg
                            </button>
                          ) : ['published', 'ongoing', 'judging'].includes(h.status) ? (
                            <button
                              type="button"
                              disabled={togglingId === h._id}
                              onClick={() => handleOpenRegistration(h._id)}
                              className="text-primary-soft hover:text-white transition-colors disabled:opacity-60"
                            >
                              Open reg
                            </button>
                          ) : null}
                          {h.status !== 'completed' && h.status !== 'archived' && (
                            <Link
                              to={`/hackathons/${h._id}/edit`}
                              className="text-muted hover:text-secondary transition-colors"
                            >
                              Edit
                            </Link>
                          )}
                          <Link
                            to={`/hackathons/${h._id}/registrations`}
                            className="text-muted hover:text-secondary transition-colors"
                          >
                            Registrations
                          </Link>
                          <Link
                            to={`/hackathons/${h._id}/submissions`}
                            className="text-muted hover:text-secondary transition-colors"
                          >
                            Submissions
                          </Link>
                          <Link
                            to={`/hackathons/${h._id}/teams`}
                            className="text-muted hover:text-secondary transition-colors"
                          >
                            Teams
                          </Link>
                          <Link
                            to={`/hackathons/${h._id}/results`}
                            className="text-muted hover:text-secondary transition-colors"
                          >
                            Results
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default HackathonList;
