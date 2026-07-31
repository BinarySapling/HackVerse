import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ChevronDown, Trophy, Users, Quote } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import BrandLogo from '../components/BrandLogo';
import api from '../config/axios';
import { getApiList } from '../utils/apiResponse';

const FEATURED_STATUSES = ['registration_open', 'published', 'ongoing'];
const FEATURED_LIMIT = 4;
const UPCOMING_LIMIT = 5;
const WINNERS_LIMIT = 3;

const testimonials = [
  {
    quote:
      'We ran our department hackathon on HackVerse instead of five spreadsheets. Registration, teams, and judging finally lived in one place.',
    name: 'Priya Sharma',
    role: 'CS Club Lead, State University',
  },
  {
    quote:
      'As a participant, I liked knowing exactly when submissions opened and where our team stood on the leaderboard. No guessing games.',
    name: 'Marcus Chen',
    role: 'Final-year student',
  },
  {
    quote:
      'Judging was straightforward — assigned events, clear criteria, scores tied to each project. Our panel finished on time for once.',
    name: 'Dr. Anika Rao',
    role: 'Faculty judge',
  },
];

const formatStatus = (status) => (status || '').replaceAll('_', ' ');

const statusBadgeVariant = (status) => {
  if (status === 'ongoing') return 'success';
  if (status === 'registration_open' || status === 'published') return 'primary';
  return 'default';
};

const hackathonPath = (h) => `/hackathons/${h.slug || h._id}`;

const getFeatured = (list) =>
  list
    .filter((h) => FEATURED_STATUSES.includes(h.status))
    .sort((a, b) => FEATURED_STATUSES.indexOf(a.status) - FEATURED_STATUSES.indexOf(b.status))
    .slice(0, FEATURED_LIMIT);

const getUpcoming = (list) => {
  const now = Date.now();
  return list
    .filter((h) => h.hackathonStart && new Date(h.hackathonStart).getTime() > now)
    .sort((a, b) => new Date(a.hackathonStart) - new Date(b.hackathonStart))
    .slice(0, UPCOMING_LIMIT);
};

const isCompletedEvent = (h) => h.status === 'completed' || h.winnersAnnounced;

const getPastWinners = (list) =>
  list
    .filter(isCompletedEvent)
    .sort((a, b) => new Date(b.hackathonEnd || b.hackathonStart) - new Date(a.hackathonEnd || a.hackathonStart))
    .slice(0, WINNERS_LIMIT);

const storySections = [
  {
    step: '01',
    title: 'Create Hackathons',
    lead: 'Set up an event in minutes, not days.',
    body: 'Organizers define timelines, team size limits, posters, and prize breakdowns from one clean form. Draft privately, invite judges early, then publish when you are ready. Every setting stays editable so academic events can adapt as plans change.',
    points: [
      'Registration and submission windows',
      'Poster image and prize places',
      'Draft to published in a few clicks',
    ],
  },
  {
    step: '02',
    title: 'Team Collaboration',
    lead: 'Students build together under clear rules.',
    body: 'Participants register, form teams, and invite peers without chasing spreadsheets. Capacity limits are enforced automatically so team sizes stay fair. Everyone sees membership status in one place and can focus on the project instead of logistics.',
    points: [
      'Invite teammates by email',
      'Respect min and max team size',
      'Track who has joined in real time',
    ],
  },
  {
    step: '03',
    title: 'Project Submission',
    lead: 'Ship demos when the window opens.',
    body: 'Teams submit GitHub repos, live demos, and short write-ups inside the submission window. Late chaos is reduced with clear deadlines and a simple form. Organizers always know what has been turned in and what is still pending.',
    points: [
      'Repo, demo, and write-up fields',
      'Open only during the submission window',
      'Update submissions before the deadline',
    ],
  },
  {
    step: '04',
    title: 'Judge Evaluation',
    lead: 'Scoring that feels fair and structured.',
    body: 'Assigned judges review submissions with weighted criteria for innovation, technology, and presentation. Scores stay tied to each project so reviews remain consistent across the panel. No more scattered spreadsheets after the demo day.',
    points: [
      'Weighted judging criteria',
      'Assigned events per judge',
      'Clear score entry for each team',
    ],
  },
  {
    step: '05',
    title: 'Live Leaderboards',
    lead: 'Watch rankings move as scores come in.',
    body: 'Leaderboards update as evaluations land, giving participants a transparent view of standing. Organizers can follow the race without exporting files. Public boards keep the energy high while results stay grounded in real scores.',
    points: [
      'Public leaderboard pages',
      'Ranks based on judge scores',
      'Refresh as evaluations complete',
    ],
  },
  {
    step: '06',
    title: 'Results and Winners',
    lead: 'Close the event with a clear finish.',
    body: 'Announce winners, share prize places, and wrap the lifecycle without leaving the platform. From first draft to final ranking, HackVerse keeps organizers, participants, and judges aligned on one flow students can actually use.',
    points: [
      'Publish winners with confidence',
      'Match prizes to places',
      'End-to-end academic event flow',
    ],
  },
];

const Landing = () => {
  const [hackathons, setHackathons] = useState([]);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [winnersLoading, setWinnersLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/hackathons', { params: { limit: 100 } })
      .then((response) => {
        if (!active) return;
        const list = getApiList(response);
        setHackathons(list);

        const past = getPastWinners(list);
        if (past.length === 0) {
          setWinners([]);
          setWinnersLoading(false);
          return;
        }

        Promise.all(
          past.map(async (h) => {
            try {
              const lbRes = await api.get(`/hackathons/${h._id}/leaderboard`, {
                params: { page: 1, limit: 1 },
              });
              const topTeam = getApiList(lbRes)[0] || null;
              return { hackathon: h, topTeam };
            } catch {
              return { hackathon: h, topTeam: null };
            }
          })
        ).then((entries) => {
          if (active) setWinners(entries);
        }).finally(() => {
          if (active) setWinnersLoading(false);
        });
      })
      .catch(() => {
        if (active) {
          setHackathons([]);
          setWinners([]);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const featured = getFeatured(hackathons);
  const upcoming = getUpcoming(hackathons);
  const openRegistrationCount = hackathons.filter((h) => h.status === 'registration_open').length;
  const completedCount = hackathons.filter(isCompletedEvent).length;
  const liveCount = hackathons.filter((h) => h.status === 'ongoing').length;

  const formatStat = (count) => (count > 0 ? String(count) : '—');

  const stats = [
    { label: 'Hackathons hosted', value: formatStat(hackathons.length) },
    { label: 'Open for registration', value: formatStat(openRegistrationCount) },
    { label: 'Events completed', value: formatStat(completedCount) },
    { label: 'Live right now', value: formatStat(liveCount) },
  ];

  const scrollToContent = () => {
    document.getElementById('landing-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/25 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/5 h-80 w-80 rounded-full bg-primary-soft/10 blur-[110px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pb-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-7"
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary-soft">
              Build. Innovate. Win.
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.08]">
              The Global Arena for <span className="gradient-text">Visionary Builders.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-xl leading-relaxed">
              Manage, register, build, and judge hackathons in one smooth platform made for student teams.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-base font-semibold text-primary-soft hover:text-white transition-colors"
              >
                Start Building <ArrowRight size={18} />
              </Link>
              <Link
                to="/hackathons"
                className="text-base font-medium text-muted hover:text-secondary transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-primary-soft"
              >
                Browse Hackathons
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative flex items-center justify-center min-h-[340px]"
          >
            <div className="absolute inset-10 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative float-slow pulse-glow rounded-[2rem] bg-[#121018]/70 p-8 backdrop-blur-sm">
              <BrandLogo to={null} size="hero" showText={false} />
            </div>
          </motion.div>
        </div>

        <button
          type="button"
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-muted hover:text-secondary transition-colors"
          aria-label="Scroll to content"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">Explore</span>
          <ChevronDown size={20} className="animate-bounce" />
        </button>
      </section>

      <div id="landing-content" className="section-overlap">
        {/* Stats strip - text only, no cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6"
          >
            {stats.map((item) => (
              <div key={item.label} className="text-center md:text-left">
                <p className="text-3xl sm:text-4xl font-display font-bold text-primary-soft">{item.value}</p>
                <p className="text-sm text-muted mt-2">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Featured hackathons */}
        <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#1a1028]/60 via-[#15101f]/40 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
            >
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted mb-3">
                  Live on HackVerse
                </p>
                <h2 className="text-3xl sm:text-4xl font-display font-bold">Featured hackathons</h2>
                <p className="text-muted mt-3 max-w-xl text-sm sm:text-base">
                  Events open for registration or already in progress.
                </p>
              </div>
              <Link
                to="/hackathons"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-soft hover:text-white transition-colors shrink-0"
              >
                View all <ArrowRight size={14} />
              </Link>
            </motion.div>

            {isLoading ? (
              <p className="text-sm text-muted">Loading hackathons…</p>
            ) : featured.length === 0 ? (
              <p className="text-sm text-muted">No featured hackathons right now. Check back soon.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {featured.map((h, index) => (
                  <motion.li
                    key={h._id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                  >
                    <Link
                      to={hackathonPath(h)}
                      className="group flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-[#121018]/80 ring-1 ring-white/[0.06] hover:ring-primary/30 transition-all"
                    >
                      <div className="relative h-28 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-[#14101c]">
                        {h.banner ? (
                          <img
                            src={h.banner}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/35 via-[#1a1028] to-[#09090B] flex items-center justify-center">
                            <Trophy className="text-primary-soft/70" size={22} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex flex-col gap-2">
                        <Badge variant={statusBadgeVariant(h.status)}>{formatStatus(h.status)}</Badge>
                        <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-primary-soft transition-colors">
                          {h.title}
                        </h3>
                        {h.tagline && (
                          <p className="text-sm text-muted line-clamp-2">{h.tagline}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mt-1">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={12} className="opacity-70" />
                            {new Date(h.hackathonStart).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users size={12} className="opacity-70" />
                            Team {h.minTeamSize}-{h.maxTeamSize}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Upcoming events */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
            >
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted mb-3">
                  On the calendar
                </p>
                <h2 className="text-3xl sm:text-4xl font-display font-bold">Upcoming events</h2>
                <p className="text-muted mt-3 max-w-xl text-sm sm:text-base">
                  Hackathons starting soon — sorted by date.
                </p>
              </div>
              <Link
                to="/hackathons"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-soft hover:text-white transition-colors shrink-0"
              >
                Browse all <ArrowRight size={14} />
              </Link>
            </motion.div>

            {isLoading ? (
              <p className="text-sm text-muted">Loading events…</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted">No upcoming events scheduled yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-white/[0.06]">
                {upcoming.map((h, index) => (
                  <motion.li
                    key={h._id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                  >
                    <Link
                      to={hackathonPath(h)}
                      className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 py-5 hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors"
                    >
                      <time
                        dateTime={h.hackathonStart}
                        className="font-mono text-xs text-primary-soft tracking-wide shrink-0 sm:w-36"
                      >
                        {new Date(h.hackathonStart).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold group-hover:text-primary-soft transition-colors">
                          {h.title}
                        </p>
                        {h.tagline && (
                          <p className="text-sm text-muted mt-0.5 line-clamp-1">{h.tagline}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted group-hover:text-primary-soft transition-colors shrink-0">
                        Details <ArrowRight size={12} />
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </section>

        </section>

        {/* Previous winners */}
        <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#1a1028]/60 via-[#15101f]/40 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
            >
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted mb-3">
                  Hall of fame
                </p>
                <h2 className="text-3xl sm:text-4xl font-display font-bold">Previous winners</h2>
                <p className="text-muted mt-3 max-w-xl text-sm sm:text-base">
                  Recently wrapped events and top teams from the public leaderboard.
                </p>
              </div>
            </motion.div>

            {isLoading || winnersLoading ? (
              <p className="text-sm text-muted">Loading results…</p>
            ) : winners.length === 0 ? (
              <p className="text-sm text-muted">No completed events yet. Check back after the first hackathon wraps.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {winners.map(({ hackathon: h, topTeam }, index) => (
                  <motion.li
                    key={h._id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                  >
                    <div className="flex flex-col h-full p-5 rounded-2xl bg-[#121018]/80 ring-1 ring-white/[0.06]">
                      <p className="text-xs font-mono text-primary-soft tracking-wide mb-2">
                        {new Date(h.hackathonEnd || h.hackathonStart).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <h3 className="font-display font-semibold text-lg leading-snug">{h.title}</h3>
                      {topTeam ? (
                        <div className="mt-4 flex items-start gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Trophy size={16} className="text-primary-soft" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-secondary">{topTeam.teamName}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {topTeam.leader}
                              {topTeam.averageScore != null && ` · ${topTeam.averageScore} pts`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted mt-4">Results available on the leaderboard.</p>
                      )}
                      <Link
                        to={`/hackathons/${h._id}/leaderboard`}
                        className="mt-auto pt-5 inline-flex items-center gap-1.5 text-xs font-medium text-primary-soft hover:text-white transition-colors"
                      >
                        View leaderboard <ArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Intro */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold leading-tight">
              One flow from launch to winners
            </h2>
            <p className="text-muted mt-4 leading-relaxed">
              Scroll through the full lifecycle. Each stage is built for organizers, participants, and judges who need clarity over complexity.
            </p>
          </motion.div>
        </section>

        {/* Vertical story sections */}
        {storySections.map((section, index) => {
          const reverse = index % 2 === 1;
          const isPurple = index % 2 === 0;
          return (
            <section
              key={section.step}
              className={`relative py-20 sm:py-28 ${
                isPurple
                  ? 'bg-gradient-to-b from-[#1a1028] via-[#15101f] to-[#120e1a]'
                  : 'bg-[#09090B]'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45 }}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start ${
                    reverse ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div className="lg:col-span-5">
                    <p className="font-mono text-sm text-primary-soft tracking-widest mb-3">{section.step}</p>
                    <h3 className="text-3xl sm:text-4xl font-display font-bold leading-tight">{section.title}</h3>
                    <p className="text-lg text-secondary/90 mt-4">{section.lead}</p>
                  </div>

                  <div className="lg:col-span-7">
                    <p className="text-muted text-base sm:text-lg leading-relaxed">{section.body}</p>
                    <ul className="mt-8 space-y-3">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-3 text-sm sm:text-base text-secondary/85">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })}

        {/* Who it's for */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mb-14"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted mb-4">Built for campuses</p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold">Roles that stay in sync</h2>
              <p className="text-muted mt-4 leading-relaxed">
                HackVerse is designed around the people who actually run academic hackathons — not enterprise dashboards full of noise.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
              {[
                {
                  title: 'Organizers',
                  text: 'Create events, invite judges, publish results, and keep timelines honest from draft to wrap-up.',
                },
                {
                  title: 'Participants',
                  text: 'Find hackathons, register, form teams, and submit projects without juggling five different tools.',
                },
                {
                  title: 'Judges',
                  text: 'Open assigned events, score with clear criteria, and help leaderboards reflect real evaluation.',
                },
              ].map((role, index) => (
                <motion.div
                  key={role.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <p className="font-mono text-xs text-primary-soft tracking-widest mb-3">0{index + 1}</p>
                  <h3 className="text-xl font-display font-semibold">{role.title}</h3>
                  <p className="text-muted mt-3 leading-relaxed text-sm sm:text-base">{role.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-[#1a1028] via-[#15101f] to-[#120e1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mb-14"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted mb-4">
                From the community
              </p>
              <h2 className="text-3xl sm:text-4xl font-display font-bold">What people say</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((item, index) => (
                <motion.blockquote
                  key={item.name}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="flex flex-col gap-4 p-6 rounded-2xl bg-[#121018]/70 ring-1 ring-white/[0.06]"
                >
                  <Quote size={18} className="text-primary-soft/60" />
                  <p className="text-sm text-secondary/90 leading-relaxed flex-1">&ldquo;{item.quote}&rdquo;</p>
                  <footer>
                    <p className="text-sm font-semibold text-secondary">{item.name}</p>
                    <p className="text-xs text-muted mt-0.5">{item.role}</p>
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* Blended CTA - full width, no card */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-[36rem] max-w-full rounded-full bg-primary/20 blur-[100px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center"
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-primary-soft mb-5">
              Your next hackathon starts here
            </p>
            <h2 className="text-3xl sm:text-5xl font-display font-bold leading-tight">
              Ready when you are.
            </h2>
            <p className="text-muted mt-5 text-base sm:text-lg leading-relaxed">
              Create an account, explore live events, or sign in to your dashboard. The full lifecycle is already waiting.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Create free account
                </Button>
              </Link>
              <Link to="/hackathons">
                <Button variant="outline" size="lg">
                  Browse hackathons
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Landing;
