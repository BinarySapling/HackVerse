import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiList } from '../../utils/apiResponse';
import { Calendar, UserPlus, Users, Share2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ParticipantDashboard = () => {
  const [hackathons, setHackathons] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const hRes = await api.get('/hackathons');
        setHackathons(getApiList(hRes));

        const rRes = await api.get('/registrations/me');
        setMyRegistrations(getApiList(rRes));
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
      // Refresh registrations
      const rRes = await api.get('/registrations/me');
      setMyRegistrations(getApiList(rRes));
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-secondary">Participant Arena</h2>
        <p className="text-xs text-slate-400">Discover active hackathons, form development teams, and track project status.</p>
      </div>

      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Active Hackathons Grid */}
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
                        <p className="text-xs text-slate-500">{h.tagline || 'No tagline set'}</p>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                          <Calendar size={14} />
                          <span>Ends: {new Date(h.hackathonEnd).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4 flex justify-between items-center">
                        <Link to={`/hackathons/${h.slug}`} className="text-xs text-primary font-semibold hover:underline">
                          View details
                        </Link>
                        {registered ? (
                          <div className="flex gap-2">
                            <Link to={`/hackathons/${h._id}/team`}>
                              <Button variant="secondary" size="sm" className="gap-1">
                                <Users size={12} /> Team
                              </Button>
                            </Link>
                            <Link to={`/hackathons/${h._id}/submit`}>
                              <Button variant="primary" size="sm" className="gap-1">
                                <Share2 size={12} /> Submission
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRegister(h._id)}
                            className="gap-1.5"
                          >
                            <UserPlus size={14} /> Register Event
                          </Button>
                        )}
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
