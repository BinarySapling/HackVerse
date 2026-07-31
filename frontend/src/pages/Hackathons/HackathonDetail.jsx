import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { getApiData, getApiList } from '../../utils/apiResponse';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Trophy,
  Mail,
  Users,
  ArrowRight,
  Calendar,
  Gift,
  Clock,
  MapPin,
  Monitor,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatStatus = (status) => (status || '').replaceAll('_', ' ');

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatMode = (mode) => {
  if (!mode) return 'Online';
  return mode.charAt(0).toUpperCase() + mode.slice(1);
};

const HackathonDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTogglingRegistration, setIsTogglingRegistration] = useState(false);

  const fetchHackathonAndReg = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/hackathons/${slug}`);
      const hData = getApiData(response);
      setHackathon(hData);

      if (isAuthenticated && user?.role === 'participant') {
        const rRes = await api.get('/registrations/me');
        setMyRegistrations(getApiList(rRes));
      }
    } catch (err) {
      toast.error('Failed to load hackathon details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathonAndReg();
  }, [slug, isAuthenticated]);

  const handleRegister = async () => {
    if (!isAuthenticated) return navigate('/login');
    if (!hackathon) return;
    if (user?.role && user.role !== 'participant') {
      toast.error('Only participant accounts can register for hackathons.');
      return;
    }

    const end = hackathon.registrationEnd ? new Date(hackathon.registrationEnd).getTime() : null;
    const closed =
      hackathon.status !== 'registration_open' ||
      (end !== null && Date.now() > end) ||
      ['ongoing', 'judging', 'completed', 'archived'].includes(hackathon.status);
    if (closed) {
      toast.error('Registration is closed for this hackathon.');
      return;
    }

    setIsRegistering(true);
    try {
      await api.post(`/hackathons/${hackathon._id}/register`);
      toast.success('Registration submitted! Waiting for organizer approval.');
      fetchHackathonAndReg();
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleOpenRegistration = async () => {
    if (!hackathon) return;
    setIsTogglingRegistration(true);
    try {
      await api.post(`/hackathons/${hackathon._id}/open-registration`);
      toast.success('Registration is now open.');
      fetchHackathonAndReg();
    } catch (err) {
      toast.error(err.message || 'Failed to open registration.');
    } finally {
      setIsTogglingRegistration(false);
    }
  };

  const handleCloseRegistration = async () => {
    if (!hackathon) return;
    setIsTogglingRegistration(true);
    try {
      await api.post(`/hackathons/${hackathon._id}/close-registration`);
      toast.success('Registration closed.');
      fetchHackathonAndReg();
    } catch (err) {
      toast.error(err.message || 'Failed to close registration.');
    } finally {
      setIsTogglingRegistration(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24">
        <Loader size="lg" />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="text-center py-24 flex flex-col gap-3 pt-28">
        <p className="text-sm text-muted">Hackathon details not found.</p>
        <Link to="/hackathons" className="text-primary-soft hover:text-white">
          Back to hackathons
        </Link>
      </div>
    );
  }

  const registered = myRegistrations.some(
    (reg) => reg.hackathon?._id === hackathon._id && reg.status === 'registered'
  );

  const isOwnerOrganizer =
    user?.role === 'organizer' &&
    (hackathon.organizer?._id === user?.id || hackathon.organizer === user?.id);

  const isStaffViewer = user?.role === 'organizer' || user?.role === 'judge' || user?.role === 'admin';
  const isCompleted = ['completed', 'archived'].includes(hackathon.status);
  const canEditEvent = (isOwnerOrganizer || user?.role === 'admin') && !isCompleted;

  const now = Date.now();
  const registrationEndMs = hackathon.registrationEnd
    ? new Date(hackathon.registrationEnd).getTime()
    : null;
  const registrationStartMs = hackathon.registrationStart
    ? new Date(hackathon.registrationStart).getTime()
    : null;
  const registrationClosed =
    hackathon.status !== 'registration_open' ||
    (registrationEndMs !== null && now > registrationEndMs) ||
    ['ongoing', 'judging', 'completed', 'archived'].includes(hackathon.status);
  const registrationNotStarted =
    !registrationClosed &&
    registrationStartMs !== null &&
    now < registrationStartMs;
  const registrationOpen = !registrationClosed && !registrationNotStarted;

  const timeline = [
    { label: 'Registration opens', value: hackathon.registrationStart },
    { label: 'Registration closes', value: hackathon.registrationEnd },
    { label: 'Hackathon starts', value: hackathon.hackathonStart },
    { label: 'Hackathon ends', value: hackathon.hackathonEnd },
  ];
  if (hackathon.submissionStart) {
    timeline.push({ label: 'Submissions open', value: hackathon.submissionStart });
  }
  if (hackathon.submissionDeadline) {
    timeline.push({ label: 'Submission deadline', value: hackathon.submissionDeadline });
  }

  const statusVariant =
    hackathon.status === 'ongoing'
      ? 'success'
      : hackathon.status === 'registration_open' || hackathon.status === 'published'
        ? 'primary'
        : 'default';

  return (
    <div className="w-full">
      {/* Full-bleed poster */}
      <section className="relative w-full h-[42vh] min-h-[280px] max-h-[480px] sm:h-[48vh] bg-[#121018] overflow-hidden">
        {hackathon.banner ? (
          <img
            src={resolveAssetUrl(hackathon.banner)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-[#1a1028] to-[#09090B]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-[#09090B]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/70 via-transparent to-[#09090B]/40" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
          <div className="pt-20 sm:pt-24">
            <Link
              to="/hackathons"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors w-fit"
            >
              <ArrowLeft size={14} /> All hackathons
            </Link>
          </div>

          <div className="mt-auto pb-10 sm:pb-12 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant={statusVariant}>{formatStatus(hackathon.status)}</Badge>
              {hackathon.visibility && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                  {hackathon.visibility}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-[1.1] text-white">
              {hackathon.title}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70 max-w-xl">
              {hackathon.tagline || 'Explore and innovate.'}
            </p>
          </div>
        </div>
      </section>

      {/* Content panel overlapping poster */}
      <section className="relative z-10 -mt-6 sm:-mt-8 rounded-t-[1.75rem] bg-[#0c0b10] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Quick facts strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
            {[
              {
                icon: Calendar,
                label: 'Starts',
                value: new Date(hackathon.hackathonStart).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              },
              {
                icon: Clock,
                label: 'Ends',
                value: new Date(hackathon.hackathonEnd).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              },
              {
                icon: Users,
                label: 'Team size',
                value: `${hackathon.minTeamSize}–${hackathon.maxTeamSize}`,
              },
              {
                icon: Gift,
                label: 'Prize pool',
                value: hackathon.prizePool || 'TBA',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] px-4 py-4 flex items-start gap-3"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-soft">
                  <item.icon size={15} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{item.label}</p>
                  <p className="text-sm sm:text-base font-semibold mt-1 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[
              {
                icon: Monitor,
                label: 'Mode',
                value: formatMode(hackathon.mode),
              },
              hackathon.theme && {
                icon: Sparkles,
                label: 'Theme',
                value: hackathon.theme,
              },
              hackathon.venue && {
                icon: MapPin,
                label: 'Venue',
                value: hackathon.venue,
              },
            ]
              .filter(Boolean)
              .map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.06] px-4 py-4 flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-soft">
                    <item.icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted">{item.label}</p>
                    <p className="text-sm sm:text-base font-semibold mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left column */}
            <div className="lg:col-span-7 flex flex-col gap-10">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-primary-soft mb-2">Overview</p>
                <h2 className="text-2xl font-display font-semibold mb-4">About this event</h2>
                <p className="text-muted leading-relaxed whitespace-pre-line text-sm sm:text-[15px]">
                  {hackathon.description}
                </p>
              </div>

              {hackathon.rules && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-soft mb-2">Guidelines</p>
                  <h2 className="text-2xl font-display font-semibold mb-4">Rules</h2>
                  <p className="text-muted leading-relaxed whitespace-pre-line text-sm sm:text-[15px]">
                    {hackathon.rules}
                  </p>
                </div>
              )}

              {(hackathon.prizePool || hackathon.prizes?.length > 0) && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-soft mb-2">Rewards</p>
                  <h2 className="text-2xl font-display font-semibold mb-4">Prizes</h2>
                  {hackathon.prizePool && (
                    <p className="text-primary-soft font-semibold mb-4">
                      Total pool: {hackathon.prizePool}
                    </p>
                  )}
                  {hackathon.prizes?.length > 0 && (
                    <div className="divide-y divide-white/[0.06] rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] overflow-hidden">
                      {hackathon.prizes.map((prize, index) => (
                        <div
                          key={index}
                          className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div>
                            <p className="font-semibold">{prize.title}</p>
                            {prize.description && (
                              <p className="text-sm text-muted mt-1">{prize.description}</p>
                            )}
                          </div>
                          {prize.value && (
                            <p className="text-primary-soft font-semibold shrink-0">{prize.value}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {hackathon.judgingCriteria?.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-soft mb-2">Evaluation</p>
                  <h2 className="text-2xl font-display font-semibold mb-4">Judging criteria</h2>
                  <div className="rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.06]">
                    {hackathon.judgingCriteria.map((criterion, index) => (
                      <div
                        key={index}
                        className="px-5 py-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold">{criterion.criteriaName}</p>
                          {criterion.description && (
                            <p className="text-sm text-muted mt-1">{criterion.description}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-primary-soft tabular-nums">
                          {criterion.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right column */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-24 flex flex-col gap-5">
                {/* CTA panel */}
                <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-[#1a1028] via-[#14101c] to-[#0f0d14] p-6 shadow-[0_20px_60px_rgba(124,58,237,0.15)]">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-soft mb-2">
                    {registered
                      ? 'You are in'
                      : registrationClosed
                        ? 'Registration closed'
                        : registrationNotStarted
                          ? 'Coming soon'
                          : 'Join the event'}
                  </p>
                  <h3 className="text-xl font-display font-semibold mb-1">
                    {registered
                      ? 'Continue building'
                      : registrationClosed
                        ? 'Registrations are closed'
                        : registrationNotStarted
                          ? 'Registration opens soon'
                          : 'Ready to compete?'}
                  </h3>
                  <p className="text-sm text-muted mb-5">
                    {registered
                      ? 'Manage your team and submit your project.'
                      : registrationClosed
                        ? 'This event is no longer accepting new registrations.'
                        : registrationNotStarted
                          ? `Opens ${formatDateTime(hackathon.registrationStart)}.`
                          : 'Register to form a team and start shipping.'}
                  </p>

                  {canEditEvent ? (
                    <div className="flex flex-col gap-2.5">
                      {hackathon.status === 'registration_open' ? (
                        <button
                          type="button"
                          onClick={handleCloseRegistration}
                          disabled={isTogglingRegistration}
                          className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/[0.08] text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                          {isTogglingRegistration ? 'Updating...' : 'Close registration'}
                        </button>
                      ) : ['published', 'ongoing', 'judging'].includes(hackathon.status) ? (
                        <button
                          type="button"
                          onClick={handleOpenRegistration}
                          disabled={isTogglingRegistration}
                          className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-primary hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                        >
                          {isTogglingRegistration ? 'Updating...' : 'Open registration'}
                        </button>
                      ) : null}
                      <Link
                        to={`/hackathons/${hackathon._id}/edit`}
                        className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold transition-colors"
                      >
                        Edit event
                      </Link>
                    </div>
                  ) : isOwnerOrganizer || user?.role === 'admin' ? (
                    <div className="flex flex-col gap-2.5">
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-white/5 ring-1 ring-white/[0.08] text-muted text-sm font-semibold cursor-not-allowed"
                      >
                        Editing locked
                      </button>
                      <Link
                        to={`/hackathons/${hackathon._id}/results`}
                        className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-primary hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
                      >
                        View results
                      </Link>
                    </div>
                  ) : registered ? (
                    <div className="flex flex-col gap-2.5">
                      <Link
                        to={`/hackathons/${hackathon._id}/team`}
                        className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary hover:bg-violet-500 text-white text-sm font-semibold shadow-glow transition-all hover:-translate-y-0.5"
                      >
                        Go to team <ArrowRight size={16} />
                      </Link>
                      <Link
                        to={`/hackathons/${hackathon._id}/submit`}
                        className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/[0.08] text-sm font-medium transition-colors"
                      >
                        Submit project
                      </Link>
                    </div>
                  ) : isStaffViewer ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-white/5 ring-1 ring-white/[0.08] text-muted text-sm font-semibold cursor-not-allowed"
                    >
                      {user?.role === 'judge' ? 'Judges can\'t register' : 'Organizers can\'t register'}
                    </button>
                  ) : registrationClosed ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-white/5 ring-1 ring-white/[0.08] text-muted text-sm font-semibold cursor-not-allowed"
                    >
                      Closed
                    </button>
                  ) : registrationNotStarted ? (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-white/5 ring-1 ring-white/[0.08] text-muted text-sm font-semibold cursor-not-allowed"
                    >
                      Opens soon
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={isRegistering || !registrationOpen}
                      className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary hover:bg-violet-500 disabled:opacity-60 disabled:pointer-events-none text-white text-sm font-semibold shadow-glow transition-all hover:-translate-y-0.5"
                    >
                      {isRegistering ? (
                        'Registering...'
                      ) : (
                        <>
                          {isAuthenticated ? 'Register Now' : 'Sign in to Register'}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}

                  {isStaffViewer &&
                    !isOwnerOrganizer &&
                    user?.role !== 'admin' &&
                    !registered && (
                      <p className="text-xs text-muted text-center mt-3">
                        Only participant accounts can register for hackathons.
                      </p>
                    )}

                  <Link
                    to={`/hackathons/${hackathon._id}/leaderboard`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-sm text-primary-soft hover:text-white transition-colors"
                  >
                    <Trophy size={15} /> View leaderboard
                  </Link>
                </div>

                {/* Timeline */}
                <div className="rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] p-6">
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-muted mb-5">Timeline</h3>
                  <ol className="space-y-0">
                    {timeline.map((item, index) => (
                      <li key={item.label} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/20 shrink-0 mt-1.5" />
                          {index < timeline.length - 1 && (
                            <span className="w-px flex-1 bg-gradient-to-b from-primary/40 to-white/10 my-1 min-h-[1.75rem]" />
                          )}
                        </div>
                        <div className={index < timeline.length - 1 ? 'pb-5' : ''}>
                          <p className="text-xs text-muted uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm font-medium mt-1">{formatDateTime(item.value)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Meta */}
                <div className="rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Users size={16} className="text-primary-soft shrink-0" />
                    <span>
                      {hackathon.minTeamSize} to {hackathon.maxTeamSize} members per team
                      {hackathon.maxTeams ? ` · max ${hackathon.maxTeams} teams` : ''}
                    </span>
                  </div>
                  {hackathon.contactEmail && (
                    <a
                      href={`mailto:${hackathon.contactEmail}`}
                      className="inline-flex items-center gap-3 text-sm text-primary-soft hover:text-white break-all"
                    >
                      <Mail size={16} className="shrink-0" />
                      {hackathon.contactEmail}
                    </a>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HackathonDetail;
