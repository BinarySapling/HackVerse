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
import { ClipboardCheck, Award, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const JudgeDashboard = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      setIsLoading(true);
      try {
        const [evalRes, statsRes] = await Promise.all([
          api.get('/evaluations/me'),
          api.get('/dashboard/stats'),
        ]);
        setEvaluations(getApiList(evalRes));
        setStats(getApiData(statsRes));
      } catch {
        toast.error('Failed to load judge evaluations.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  const statItems = [
    { label: 'Assigned', value: stats?.assignedHackathons ?? 0 },
    { label: 'Pending', value: stats?.pendingEvaluations ?? 0 },
    { label: 'Completed', value: stats?.completedEvaluations ?? 0 },
  ];

  return (
    <div className="relative flex flex-col">
      <PageHeader
        eyebrow="Judge console"
        title="Welcome back,"
        highlight={user?.firstName || 'Judge'}
        description="Score project submissions across your assigned hackathons."
        actions={
          <Link to="/judge/hackathons">
            <Button className="gap-2">
              <ClipboardCheck size={16} /> Evaluate submissions
            </Button>
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
        <div className="grid grid-cols-3 gap-x-6 gap-y-8">
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
            <p className="soft-section-label mb-2">History</p>
            <h2 className="text-2xl font-display font-semibold tracking-tight">
              Recent evaluations
            </h2>
          </div>
          <Link
            to="/judge/hackathons"
            className="group text-sm text-muted hover:text-primary-soft inline-flex items-center gap-1 transition-colors"
          >
            Open queue
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <Loader size="lg" />
        ) : evaluations.length === 0 ? (
          <div className="py-14">
            <Sparkles className="text-primary-soft/80 mb-4" size={22} />
            <p className="text-muted mb-3">No evaluations submitted yet.</p>
            <Link
              to="/judge/hackathons"
              className="text-primary-soft font-medium hover:text-white inline-flex items-center gap-1.5 transition-colors"
            >
              Start evaluating <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col">
            {evaluations.map((ev, index) => (
              <li key={ev._id}>
                {index > 0 && <div className="soft-row-divider" />}
                <div className="py-6 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                      <h3 className="font-display font-semibold text-[1.05rem] tracking-tight truncate">
                        {ev.submission?.team?.name || 'Assigned project'}
                      </h3>
                      <Badge variant="success">Score {ev.totalScore}/60</Badge>
                    </div>
                    <p className="text-xs text-muted italic line-clamp-1">
                      “{ev.remarks || 'No remarks left'}”
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted/80 mt-3 tracking-wide">
                      <span>Inn {ev.innovationScore}</span>
                      <span>UX {ev.uiuxScore ?? 0}</span>
                      <span>Tech {ev.technicalScore}</span>
                      <span>Pres {ev.presentationScore}</span>
                      <span>Code {ev.codeQualityScore ?? 0}</span>
                      <span>Solve {ev.problemSolvingScore ?? 0}</span>
                    </div>
                  </div>
                  <Link
                    to={`/judge/submissions/${ev.submission?._id || ev.submission}/evaluate`}
                    className="group inline-flex items-center gap-1.5 text-sm text-primary-soft hover:text-white transition-colors shrink-0"
                  >
                    <Award size={14} />
                    Edit
                    <ArrowRight
                      size={13}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default JudgeDashboard;
