import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiList } from '../../utils/apiResponse';
import { useAuth } from '../../context/AuthContext';
import { Calendar, ArrowRight, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const HackathonList = () => {
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const location = useLocation();
  const inDashboard = location.pathname.startsWith('/organizer/hackathons');
  const canManage = user?.role === 'organizer' || user?.role === 'admin';

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/hackathons', {
        params: inDashboard && canManage ? { includeDrafts: true } : undefined,
      });
      setHackathons(getApiList(response));
    } catch (err) {
      toast.error('Failed to load hackathons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [inDashboard]);

  const filteredHackathons = hackathons.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary tracking-tight">Hackathons</h1>
          <p className="text-sm text-slate-500">Explore active challenges, launch teams, and push innovations.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:items-center">
          <div className="w-full md:w-72">
            <Input
              id="search"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {inDashboard && user?.role === 'organizer' && (
            <Link to="/hackathons/create">
              <Button variant="primary" className="whitespace-nowrap">
                <Plus size={14} className="mr-1 inline" /> Create
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <Loader size="lg" />
      ) : filteredHackathons.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm text-slate-500">No events matched your search.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHackathons.map((h) => (
            <Card key={h._id} className={`flex flex-col justify-between gap-6 ${h.banner ? 'p-0 overflow-hidden' : ''}`}>
              {h.banner && (
                <img
                  src={h.banner}
                  alt=""
                  className="w-full h-36 object-cover"
                />
              )}
              <div className={`flex flex-col gap-6 ${h.banner ? 'px-5 pb-5' : ''}`}>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-extrabold text-lg text-secondary leading-snug">
                      {h.title}
                    </h3>
                    <Badge variant={h.status === 'ongoing' ? 'success' : h.status === 'registration_open' || h.status === 'published' ? 'primary' : 'default'}>
                      {h.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{h.tagline || 'No tagline set'}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-semibold mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>Starts: {new Date(h.hackathonStart).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <Link to={`/hackathons/${h.slug}`} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    Read details <ArrowRight size={12} />
                  </Link>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Visibility: {h.visibility}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HackathonList;
