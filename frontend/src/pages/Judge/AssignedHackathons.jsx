import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import { getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ClipboardCheck, Calendar, ExternalLink } from 'lucide-react';

const AssignedHackathons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [submissionsByHackathon, setSubmissionsByHackathon] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    const fetchAssigned = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/hackathons');
        const allEvents = getApiList(response);

        const assigned = allEvents.filter(
          (h) => h.judges && h.judges.some((j) => (j._id || j) === user?.id)
        );
        setHackathons(assigned);

        const submissionMap = {};
        await Promise.all(
          assigned.map(async (h) => {
            try {
              const subRes = await api.get(`/hackathons/${h._id}/judge-submissions`);
              submissionMap[h._id] = getApiList(subRes);
            } catch {
              submissionMap[h._id] = [];
            }
          })
        );
        setSubmissionsByHackathon(submissionMap);
      } catch {
        toast.error('Failed to load assigned events.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssigned();
  }, [user]);

  const handleEvaluateGo = (e) => {
    e.preventDefault();
    if (!submissionId.trim()) return toast.error('Please enter a valid Submission ID.');
    navigate(`/judge/submissions/${submissionId.trim()}/evaluate`);
  };

  return (
    <div className="relative flex flex-col max-w-5xl">
      <PageHeader
        eyebrow="Judge queue"
        title="Assigned events"
        description="View assigned hackathons and score team submissions."
      />

      <SoftDivider />

      <div className="pt-8 pb-4 flex flex-col gap-10">
        <section className="max-w-md">
          <p className="soft-section-label mb-4 inline-flex items-center gap-2">
            <ClipboardCheck size={13} className="text-primary-soft/80" />
            Quick evaluate
          </p>
          <form onSubmit={handleEvaluateGo} className="flex gap-2 items-end">
            <Input
              id="submissionId"
              label="Submission ID"
              placeholder="Enter submission Object ID"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
            />
            <Button type="submit" className="shrink-0 sm:mt-6">
              Go
            </Button>
          </form>
        </section>

        {isLoading ? (
          <Loader size="lg" />
        ) : hackathons.length === 0 ? (
          <p className="text-sm text-muted py-8">
            You are not assigned to judge any active hackathons.
          </p>
        ) : (
          <ul className="flex flex-col gap-10">
            {hackathons.map((h) => (
              <li key={h._id}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <h3 className="font-display font-semibold text-lg tracking-tight">{h.title}</h3>
                      <Badge variant="primary">{h.status}</Badge>
                    </div>
                    <p className="text-xs text-muted">{h.tagline || 'Explore and innovate.'}</p>
                    <p className="text-xs text-muted mt-2 inline-flex items-center gap-1.5">
                      <Calendar size={12} className="opacity-70" />
                      Starts {new Date(h.hackathonStart).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/hackathons/${h._id}/leaderboard`}
                    className="text-sm text-primary-soft hover:text-white transition-colors shrink-0"
                  >
                    Live leaderboard
                  </Link>
                </div>

                <p className="soft-section-label mb-3">Submissions</p>
                {(submissionsByHackathon[h._id] || []).length === 0 ? (
                  <p className="text-sm text-muted">No submissions yet.</p>
                ) : (
                  <ul className="flex flex-col">
                    {(submissionsByHackathon[h._id] || []).map((submission, index) => (
                      <li key={submission._id}>
                        {index > 0 && <div className="soft-row-divider" />}
                        <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold tracking-tight">
                              {submission.team?.name || 'Team'}
                            </p>
                            <div className="text-xs text-muted flex flex-wrap gap-3 mt-1.5">
                              <a
                                href={submission.githubRepo}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary-soft hover:text-white inline-flex items-center gap-1 transition-colors"
                              >
                                GitHub <ExternalLink size={10} />
                              </a>
                              {submission.demoUrl && (
                                <a
                                  href={submission.demoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary-soft hover:text-white inline-flex items-center gap-1 transition-colors"
                                >
                                  Demo <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                          <Link to={`/judge/submissions/${submission._id}/evaluate`}>
                            <Button size="sm">Evaluate</Button>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignedHackathons;
