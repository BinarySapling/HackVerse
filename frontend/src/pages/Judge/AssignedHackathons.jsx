import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
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
      } catch (err) {
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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-secondary">My Assigned Events</h2>
        <p className="text-xs text-slate-400">View assigned hackathons and score team submissions.</p>
      </div>

      <Card className="flex flex-col gap-4 max-w-md">
        <h3 className="text-sm font-bold text-secondary flex items-center gap-2">
          <ClipboardCheck size={18} className="text-primary" /> Evaluate by Submission ID
        </h3>
        <form onSubmit={handleEvaluateGo} className="flex gap-2 items-end">
          <Input
            id="submissionId"
            placeholder="Enter Submission Object ID"
            value={submissionId}
            onChange={(e) => setSubmissionId(e.target.value)}
          />
          <Button type="submit" variant="primary">
            Go
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <div className="flex flex-col gap-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Assigned Hackathons</h3>
          {hackathons.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-sm text-slate-500">You are not assigned to judge any active hackathons.</p>
            </Card>
          ) : (
            hackathons.map((h) => (
              <Card key={h._id} className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-secondary">{h.title}</h4>
                      <Badge variant="primary">{h.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{h.tagline || 'Explore and innovate.'}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                      <Calendar size={14} />
                      <span>Starts: {new Date(h.hackathonStart).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link to={`/hackathons/${h._id}/leaderboard`} className="text-xs text-primary font-bold hover:underline">
                    View Live Leaderboard
                  </Link>
                </div>

                <div className="border-t border-border pt-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Submissions</h5>
                  {(submissionsByHackathon[h._id] || []).length === 0 ? (
                    <p className="text-sm text-slate-500">No submissions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {(submissionsByHackathon[h._id] || []).map((submission) => (
                        <div key={submission._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-border">
                          <div>
                            <div className="font-semibold text-sm text-secondary">
                              {submission.team?.name || 'Team'}
                            </div>
                            <div className="text-xs text-slate-500 flex flex-wrap gap-3 mt-1">
                              <a href={submission.githubRepo} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                GitHub <ExternalLink size={10} />
                              </a>
                              {submission.demoUrl && (
                                <a href={submission.demoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                  Demo <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                          <Link to={`/judge/submissions/${submission._id}/evaluate`}>
                            <Button size="sm" variant="primary">Evaluate</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AssignedHackathons;
