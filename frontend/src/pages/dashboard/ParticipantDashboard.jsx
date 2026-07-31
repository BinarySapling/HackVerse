import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiData, getApiList } from '../../utils/apiResponse';
import { Calendar, UserPlus, Users, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ParticipantDashboard = () => {
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
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isRegistered = (hackathonId) => {
    return myRegistrations.some((reg) => reg.hackathon?._id === hackathonId && reg.status === 'registered');
  };

  const handleRegister = async (hackathonId) => {
    try {
      await api.post(`/hackathons/${hackathonId}/register`);
      toast.success('Successfully registered for the hackathon!');
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-secondary">Participant Arena</h2>
        <p className="text-xs text-slate-400">Discover active hackathons, form teams, and track submissions.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Registered</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.registeredHackathons ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Teams</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.teams ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Submitted</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.submissionStatus?.submitted ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Pending Submissions</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.submissionStatus?.pending ?? 0}</div>
          </Card>
        </div>
      )}

      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Active Events</h3>
            {hackathons.length === 0 ? (
              <Card className="text-center py-6">
                <p className="text-sm text-slate-500">No hackathons available.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hackathons.map((h) => {
                  const registered = isRegistered(h._id);
                  return (
                    <Card key={h._id} className="flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-base text-secondary">{h.title}</h4>
                          <Badge variant={registered ? 'success' : 'primary'}>
                            {registered ? 'Registered' : h.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{h.tagline || 'Build something amazing.'}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                          <Calendar size={14} />
                          <span>Ends: {new Date(h.hackathonEnd).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 flex flex-wrap gap-2">
                        {!registered ? (
                          <Button size="sm" variant="primary" className="gap-1" onClick={() => handleRegister(h._id)}>
                            <UserPlus size={14} /> Register
                          </Button>
                        ) : (
                          <>
                            <Link to={`/hackathons/${h._id}/team`}>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Users size={14} /> Team
                              </Button>
                            </Link>
                            <Link to={`/hackathons/${h._id}/submit`}>
                              <Button size="sm" variant="primary" className="gap-1">
                                <Share2 size={14} /> Submit
                              </Button>
                            </Link>
                          </>
                        )}
                        <Link to={`/hackathons/${h.slug}`}>
                          <Button size="sm" variant="secondary">Details</Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ParticipantDashboard;
