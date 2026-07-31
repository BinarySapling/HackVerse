import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { Calendar, Trash2 } from 'lucide-react';
import { getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHackathons = async () => {
    setIsLoading(true);
    try {
      // Endpoint: GET /hackathons
      const response = await api.get('/hackathons?includeDrafts=true');
      const data = getApiList(response);
      setHackathons(data);
    } catch (err) {
      toast.error('Failed to load hackathons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hackathon?')) return;
    try {
      await api.delete(`/hackathons/${id}`);
      toast.success('Hackathon deleted successfully.');
      fetchHackathons();
    } catch (err) {
      toast.error(err.message || 'Failed to delete hackathon.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      registration_open: 'primary',
      published: 'primary',
      ongoing: 'success',
      completed: 'default',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">Admin Console</h2>
          <p className="text-xs text-slate-400">Manage hackathon events across the platform.</p>
        </div>
      </div>

      {isLoading ? (
        <Loader size="lg" />
      ) : hackathons.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">No hackathons available yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hackathons.map((h) => (
            <Card key={h._id} className="flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-secondary">{h.title}</h3>
                  <Badge variant={getStatusBadgeVariant(h.status)}>{h.status}</Badge>
                </div>
                <p className="text-xs text-slate-400 font-semibold">{h.tagline || 'No tagline set'}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                  <Calendar size={14} />
                  <span>
                    Starts: {new Date(h.hackathonStart).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-border pt-4">
                <Link to={`/hackathons/${h.slug}`} className="text-xs text-primary font-semibold hover:underline">
                  View Public Info
                </Link>
                <div className="flex items-center gap-2">
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

export default AdminDashboard;
