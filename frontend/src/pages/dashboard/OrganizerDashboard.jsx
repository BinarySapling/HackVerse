import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getApiData, getApiList } from '../../utils/apiResponse';
import { resolveAssetUrl } from '../../utils/assetUrl';
import {
  Calendar,
  ArrowRight,
  Plus,
  Trophy,
  Users,
  Scale,
  Mail,
  FileText,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatStatus = (status) => (status || '').replaceAll('_', ' ');

const statusVariant = (status) => {
  if (status === 'ongoing') return 'success';
  if (status === 'registration_open' || status === 'published') return 'primary';
  if (status === 'draft') return 'warning';
  return 'default';
};

const sameId = (a, b) => String(a?._id || a || '') === String(b?._id || b || '');

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [stats, setStats] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyEvents = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, statsRes] = await Promise.all([
        api.get('/hackathons?includeDrafts=true'),
        api.get('/dashboard/stats'),
      ]);

      const allEvents = getApiList(eventsRes);
      const mine = allEvents.filter((h) => sameId(h.organizer, user?.id || user?._id));
      setHackathons(mine);

      const apiStats = getApiData(statsRes) || {};
      setStats({
        totalHackathons: apiStats.totalHackathons ?? mine.length,
        registeredTeams: apiStats.registeredTeams ?? 0,
        judges: apiStats.judges ?? 0,
        pendingInvitations: apiStats.pendingInvitations ?? 0,
        submissions: apiStats.submissions ?? 0,
        winners: apiStats.winners ?? 0,
      });
    } catch (err) {
      toast.error(err.message || 'Failed to load organizer overview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id || user?._id) fetchMyEvents();
  }, [user?.id, user?._id]);

  const handlePublish = async (id) => {
    try {
      await api.post(`/hackathons/${id}/publish`);
      toast.success('Hackathon published.');
      fetchMyEvents();
    } catch (err) {
      toast.error(err.message || 'Publish failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This action is permanent.')) return;
    try {
      await api.delete(`/hackathons/${id}`);
      toast.success('Hackathon removed.');
      fetchMyEvents();
    } catch (err) {
      toast.error(err.message || 'Deletion failed.');
    }
  };

  const handleOpenRegistration = async (id) => {
    setTogglingId(id);
    try {
      await api.post(`/hackathons/${id}/open-registration`);
      toast.success('Registration opened.');
      fetchMyEvents();
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
      fetchMyEvents();
    } catch (err) {
      toast.error(err.message || 'Failed to close registration.');
    } finally {
      setTogglingId(null);
    }
  };

  const drafts = hackathons.filter((h) => h.status === 'draft').length;
  const live = hackathons.filter((h) =>
    ['published', 'registration_open', 'ongoing'].includes(h.status)
  ).length;

  const upcoming = [...hackathons]
    .filter((h) => h.status !== 'completed' && h.status !== 'archived')
    .sort((a, b) => new Date(a.hackathonStart) - new Date(b.hackathonStart))[0];

  const statItems = [
    { label: 'Hackathons', value: stats?.totalHackathons ?? hackathons.length, icon: LayoutDashboard },
    { label: 'Teams', value: stats?.registeredTeams ?? 0, icon: Users },
    { label: 'Judges', value: stats?.judges ?? 0, icon: Scale },
    { label: 'Invites', value: stats?.pendingInvitations ?? 0, icon: Mail },
    { label: 'Submissions', value: stats?.submissions ?? 0, icon: FileText },
    { label: 'Winners', value: stats?.winners ?? 0, icon: Trophy },
  ];

  return (
    <div className="relative flex flex-col gap-0">
      {/* Soft ambient wash — not a boxed panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[min(1100px,140%)] h-[420px] opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 30% 20%, rgba(124,58,237,0.22), transparent 70%), radial-gradient(ellipse 40% 35% at 75% 10%, rgba(210,187,255,0.08), transparent 65%)',
        }}
      />

      {/* Welcome */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeUp}
        custom={0}
        className="relative pt-4 pb-12 sm:pb-14"
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-4 font-medium">
              Organizer console
            </p>
            <h1 className="text-[2.15rem] sm:text-5xl font-display font-semibold leading-[1.08] tracking-tight text-secondary">
              Welcome back,
              <br />
              <span className="bg-gradient-to-r from-primary-soft via-[#c4a8ff] to-primary bg-clip-text text-transparent">
                {user?.firstName || 'Organizer'}
              </span>
            </h1>
            <p className="mt-5 text-[15px] text-muted leading-relaxed max-w-md">
              Track live events, publish drafts, and keep teams and judges moving.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                to="/hackathons/create"
                className="inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-semibold text-white bg-primary/90 hover:bg-primary shadow-[0_0_32px_rgba(124,58,237,0.28)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(124,58,237,0.4)]"
              >
                <Plus size={16} strokeWidth={2.25} />
                Create hackathon
              </Link>
              <Link
                to="/organizer/hackathons"
                className="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-soft transition-colors duration-300"
              >
                Browse all events
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted/80 mb-2">Live</p>
              <p className="text-5xl font-display font-semibold tabular-nums text-primary-soft tracking-tight">
                {live}
              </p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted/80 mb-2">Drafts</p>
              <p className="text-5xl font-display font-semibold tabular-nums text-secondary/90 tracking-tight">
                {drafts}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Soft fade divider */}
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent"
      />

      {/* Stats */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeUp}
        custom={1}
        className="relative py-10 sm:py-12"
      >
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted/70 mb-8">At a glance</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
          {statItems.map((item, i) => (
            <motion.div
              key={item.label}
              custom={i}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="relative"
            >
              <div className="flex items-center gap-2 mb-3">
                <item.icon size={13} className="text-primary-soft/70" strokeWidth={2} />
                <span className="text-[11px] tracking-[0.16em] uppercase text-muted/75">
                  {item.label}
                </span>
              </div>
              <p className="text-[2rem] sm:text-[2.35rem] font-display font-semibold tabular-nums tracking-tight leading-none text-secondary">
                {isLoading ? '—' : item.value ?? 0}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      {/* Events + aside */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 pt-10 sm:pt-12 pb-6">
        <section className="lg:col-span-8 xl:col-span-9 lg:pr-10 min-w-0">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-muted/70 mb-2">Events</p>
              <h2 className="text-2xl font-display font-semibold tracking-tight">Recent hackathons</h2>
            </div>
            <Link
              to="/organizer/hackathons"
              className="group text-sm text-muted hover:text-primary-soft inline-flex items-center gap-1 transition-colors"
            >
              View all
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <Loader size="lg" />
          ) : hackathons.length === 0 ? (
            <div className="py-14">
              <Sparkles className="text-primary-soft/80 mb-4" size={22} />
              <p className="text-muted mb-3">No events yet.</p>
              <Link
                to="/hackathons/create"
                className="text-primary-soft font-medium hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                Launch your first hackathon <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col">
              {hackathons.slice(0, 5).map((h, index) => (
                <li key={h._id}>
                  {index > 0 && (
                    <div className="h-px bg-gradient-to-r from-white/[0.07] via-white/[0.05] to-transparent" />
                  )}
                  <div className="group py-7 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="relative w-full sm:w-[11rem] h-[6.5rem] shrink-0 overflow-hidden rounded-2xl bg-[#14101c] ring-1 ring-white/[0.06]">
                      {h.banner ? (
                        <img
                          src={resolveAssetUrl(h.banner)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-[#1a1028] to-[#09090B]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B]/50 to-transparent opacity-60" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <Link
                          to={`/hackathons/${h.slug || h._id}`}
                          className="font-display font-semibold text-[1.15rem] tracking-tight truncate hover:text-primary-soft transition-colors duration-300"
                        >
                          {h.title}
                        </Link>
                        <Badge variant={statusVariant(h.status)}>{formatStatus(h.status)}</Badge>
                      </div>
                      <p className="text-xs text-muted/90 inline-flex items-center gap-1.5">
                        <Calendar size={12} className="opacity-70" />
                        {new Date(h.hackathonStart).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {h.prizePool ? (
                          <span className="text-primary-soft/70"> · {h.prizePool}</span>
                        ) : null}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] shrink-0">
                      {h.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => handlePublish(h._id)}
                          className="text-primary-soft hover:text-white font-medium transition-colors"
                        >
                          Publish
                        </button>
                      )}
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
                        to={`/hackathons/${h._id}/results`}
                        className="text-muted hover:text-secondary transition-colors"
                      >
                        Results
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(h._id)}
                        className="text-danger/70 hover:text-danger transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Soft vertical split via gradient, not a hard rule */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:pl-10 relative">
          <div
            aria-hidden
            className="hidden lg:block absolute left-0 top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
          />

          <div className="flex flex-col gap-12">
            {upcoming && (
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={2}>
                <p className="text-[11px] tracking-[0.28em] uppercase text-primary-soft/75 mb-4">
                  Up next
                </p>
                <h3 className="font-display font-semibold text-[1.45rem] leading-snug tracking-tight text-secondary">
                  {upcoming.title}
                </h3>
                <p className="text-sm text-muted mt-4 inline-flex items-center gap-2">
                  <Calendar size={14} className="text-primary-soft/60" />
                  {new Date(upcoming.hackathonStart).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <div className="mt-4">
                  <Badge variant={statusVariant(upcoming.status)}>
                    {formatStatus(upcoming.status)}
                  </Badge>
                </div>
                <Link
                  to={`/hackathons/${upcoming.slug || upcoming._id}`}
                  className="mt-6 group inline-flex items-center gap-1.5 text-sm font-medium text-primary-soft hover:text-white transition-colors"
                >
                  Open event
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </motion.div>
            )}

            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-muted/70 mb-5">
                Quick links
              </p>
              <nav className="flex flex-col gap-0.5">
                {[
                  { to: '/hackathons/create', label: 'Create a hackathon', icon: Plus },
                  { to: '/organizer/hackathons', label: 'Manage all events', icon: LayoutDashboard },
                  { to: '/profile', label: 'Profile & password', icon: Users },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="group flex items-center gap-3.5 py-3.5 text-[15px] text-secondary/80 hover:text-primary-soft transition-colors duration-300"
                  >
                    <link.icon
                      size={15}
                      className="text-primary-soft/60 group-hover:text-primary-soft transition-colors shrink-0"
                    />
                    <span className="flex-1 font-medium tracking-tight">{link.label}</span>
                    <ArrowRight
                      size={13}
                      className="text-muted/40 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                    />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
