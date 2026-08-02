import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import PageHeader, { SoftDivider, SoftDividerMuted } from '../../components/ui/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { getApiData, getApiList } from '../../utils/apiResponse';
import { resolveAssetUrl } from '../../utils/assetUrl';
import { Calendar, UserPlus, Users, Share2, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const statusVariant = (status) => {
  if (status === 'approved') return 'success';
  if (status === 'under_review') return 'primary';
  if (status === 'rejected') return 'danger';
  return 'warning';
};

const formatReviewStatus = (status) => {
  const labels = {
    pending: 'Pending review',
    under_review: 'Under review',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  return labels[status] || null;
};

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [hRes, rRes, sRes] = await Promise.all([
          api.get('/hackathons'),
          api.get('/registrations/me'),
          api.get('/dashboard/stats'),
        ]);
        setHackathons(getApiList(hRes));
        setMyRegistrations(getApiList(rRes));
        setStats(getApiData(sRes));
      } catch {
        toast.error('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRegistrationStatus = (hackathonId) =>
    myRegistrations.find((reg) => reg.hackathon?._id === hackathonId)?.status;

  const isRegistered = (hackathonId) => getRegistrationStatus(hackathonId) === 'registered';

  const isPending = (hackathonId) => getRegistrationStatus(hackathonId) === 'pending';

  const getSubmissionReviewStatus = (hackathonId) =>
    stats?.submissionReviews?.find(
      (item) => String(item.hackathonId) === String(hackathonId)
    )?.status;

  const handleRegister = async (hackathonId) => {
    try {
      await api.post(`/hackathons/${hackathonId}/register`);
      toast.success('Registration submitted — awaiting organizer approval');
      const [rRes, sRes] = await Promise.all([
        api.get('/registrations/me'),
        api.get('/dashboard/stats'),
      ]);
      setMyRegistrations(getApiList(rRes));
      setStats(getApiData(sRes));
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    }
  };

  const statItems = [
    { label: 'Registered', value: stats?.registeredHackathons ?? 0 },
    { label: 'Teams', value: stats?.teams ?? 0 },
    { label: 'Submitted', value: stats?.submissionStatus?.submitted ?? 0 },
    { label: 'Pending', value: stats?.submissionStatus?.pending ?? 0 },
  ];

  return (
    <div className="relative flex flex-col">
      <PageHeader
        eyebrow="Participant console"
        title="Welcome back,"
        highlight={user?.firstName || 'Builder'}
        description="Discover active hackathons, form teams, and track your submissions."
        actions={
          <Link
            to="/hackathons"
            className="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary-soft transition-colors"
          >
            Browse all events
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        }
      />

      <SoftDivider />

      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeUp}
        custom={1}
        className="py-10 sm:py-12"
      >
        <p className="soft-section-label mb-8">At a glance</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {statItems.map((item) => (
            <div key={item.label}>
              <p className="text-[11px] tracking-[0.16em] uppercase text-muted/75 mb-3">
                {item.label}
              </p>
              <p className="text-[2.15rem] font-display font-semibold tabular-nums tracking-tight leading-none">
                {isLoading ? '—' : item.value}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      <SoftDividerMuted />

      <section className="pt-10 sm:pt-12 pb-4">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="soft-section-label mb-2">Events</p>
            <h2 className="text-2xl font-display font-semibold tracking-tight">Active hackathons</h2>
          </div>
        </div>

        {isLoading ? (
          <Loader size="lg" />
        ) : hackathons.length === 0 ? (
          <div className="py-14">
            <Sparkles className="text-primary-soft/80 mb-4" size={22} />
            <p className="text-muted">No hackathons available right now.</p>
          </div>
        ) : (
          <ul className="flex flex-col">
            {hackathons.map((h, index) => {
              const registered = isRegistered(h._id);
              const pending = isPending(h._id);
              const reviewStatus = getSubmissionReviewStatus(h._id);
              const reviewLabel = formatReviewStatus(reviewStatus);
              return (
                <li key={h._id}>
                  {index > 0 && <div className="soft-row-divider" />}
                  <div className="group py-6 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="relative w-full sm:w-[7.5rem] h-[4.75rem] shrink-0 overflow-hidden rounded-2xl bg-[#14101c] ring-1 ring-white/[0.06]">
                      {h.banner ? (
                        <img
                          src={resolveAssetUrl(h.banner)}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-[#1a1028] to-[#09090B]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <Link
                          to={`/hackathons/${h.slug || h._id}`}
                          className="font-display font-semibold text-[1.05rem] tracking-tight hover:text-primary-soft transition-colors"
                        >
                          {h.title}
                        </Link>
                        <Badge
                          variant={
                            registered ? 'success' : pending ? 'warning' : 'primary'
                          }
                        >
                          {registered ? 'Registered' : pending ? 'Pending approval' : h.status}
                        </Badge>
                        {reviewLabel && (
                          <Badge variant={statusVariant(reviewStatus)}>{reviewLabel}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted/90 line-clamp-1">
                        {h.tagline || 'Build something amazing.'}
                      </p>
                      <p className="text-xs text-muted mt-2 inline-flex items-center gap-1.5">
                        <Calendar size={12} className="opacity-70" />
                        Ends {new Date(h.hackathonEnd).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {!registered && !pending ? (
                        <Button size="sm" onClick={() => handleRegister(h._id)} className="gap-1.5">
                          <UserPlus size={14} /> Register
                        </Button>
                      ) : pending ? (
                        <span className="text-xs text-muted px-2">Awaiting approval</span>
                      ) : (
                        <>
                          <Link to={`/hackathons/${h._id}/team`}>
                            <Button size="sm" variant="outline" className="gap-1.5">
                              <Users size={14} /> Team
                            </Button>
                          </Link>
                          <Link to={`/hackathons/${h._id}/submit`}>
                            <Button size="sm" className="gap-1.5">
                              <Share2 size={14} /> Submit
                            </Button>
                          </Link>
                        </>
                      )}
                      <Link
                        to={`/hackathons/${h.slug || h._id}`}
                        className="text-sm text-muted hover:text-primary-soft transition-colors px-2"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ParticipantDashboard;
