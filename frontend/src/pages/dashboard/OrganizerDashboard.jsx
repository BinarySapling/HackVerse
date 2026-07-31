import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { getApiData, getApiList } from '../../utils/apiResponse';
import { Calendar, PlusCircle, Edit3, Award, Trash2, Rocket, Users, ClipboardList, Gavel } from 'lucide-react';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyEvents = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, statsRes] = await Promise.all([
        api.get('/hackathons?includeDrafts=true'),
        api.get('/dashboard/stats'),
      ]);
      const data = getApiList(eventsRes);
      setHackathons(data.filter((h) => (h.organizer?._id || h.organizer) === user?.id));
      setStats(getApiData(statsRes));
    } catch (err) {
      toast.error('Failed to load organizer hackathons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, [user?.id]);

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

  const handlePublish = async (id) => {
    try {
      await api.post(`/hackathons/${id}/publish`);
      toast.success('Hackathon published.');
      fetchMyEvents();
    } catch (err) {
      toast.error(err.message || 'Publish failed.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">Organizer Console</h2>
          <p className="text-xs text-slate-400">Launch and configure events, invite judges, and announce winners.</p>
        </div>
        <Link to="/hackathons/create">
          <Button variant="primary" className="gap-2">
            <PlusCircle size={16} /> Create Hackathon
          </Button>
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Hackathons', value: stats.totalHackathons, icon: ClipboardList },
            { label: 'Teams', value: stats.registeredTeams, icon: Users },
            { label: 'Judges', value: stats.judges, icon: Gavel },
            { label: 'Pending Invites', value: stats.pendingInvitations, icon: Users },
            { label: 'Submissions', value: stats.submissions, icon: ClipboardList },
            { label: 'Winners', value: stats.winners, icon: Award },
          ].map((item) => (
            <Card key={item.label} className="p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase">
                <item.icon size={14} /> {item.label}
              </div>
              <div className="text-2xl font-bold text-secondary mt-1">{item.value ?? 0}</div>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <Loader size="lg" />
      ) : hackathons.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">No events created yet. Launch one above!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((h) => (
            <Card key={h._id} className="flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-secondary">{h.title}</h3>
                  <Badge variant={h.status === 'ongoing' ? 'success' : h.status === 'registration_open' || h.status === 'published' ? 'primary' : 'default'}>
                    {h.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 font-semibold">{h.tagline || 'No tagline set'}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <Calendar size={14} />
                  <span>Timeline: {new Date(h.hackathonStart).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <Link to={`/hackathons/${h._id}/results`}>
                    <Button variant="outline" size="sm" className="gap-1 px-3 py-1">
                      <Award size={14} /> Results
                    </Button>
                  </Link>
                  {h.status === 'draft' && (
                    <Button variant="primary" size="sm" className="gap-1 px-3 py-1" onClick={() => handlePublish(h._id)}>
                      <Rocket size={14} /> Publish
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Link to={`/hackathons/${h._id}/edit`}>
                    <Button variant="secondary" size="sm" className="p-2">
                      <Edit3 size={14} />
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(h._id)} className="p-2">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
