import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiData, getApiList } from '../../utils/apiResponse';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Award, Mail, ArrowLeft, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const HackathonDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  const fetchHackathonAndReg = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/hackathons/${slug}`);
      const hData = getApiData(response);
      setHackathon(hData);

      if (isAuthenticated && user?.role === 'participant') {
        const rRes = await api.get('/registrations/me');
        setMyRegistrations(getApiList(rRes));
      }
    } catch (err) {
      toast.error('Failed to load hackathon details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathonAndReg();
  }, [slug, isAuthenticated]);

  const handleRegister = async () => {
    if (!isAuthenticated) return navigate('/login');
    setIsRegistering(true);
    try {
      await api.post(`/hackathons/${hackathon._id}/register`);
      toast.success('Successfully registered for the hackathon!');
      fetchHackathonAndReg();
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) return <Loader size="lg" />;
  if (!hackathon) {
    return (
      <div className="text-center py-12 flex flex-col gap-4">
        <p className="text-sm text-slate-500">Hackathon details not found.</p>
        <Link to="/hackathons" className="text-primary hover:underline">Back to List</Link>
      </div>
    );
  }

  const registered = myRegistrations.some(
    (reg) => reg.hackathon?._id === hackathon._id && reg.status === 'registered'
  );

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link to="/hackathons" className="text-slate-400 hover:text-slate-600 flex items-center gap-1.5 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to Hackathons
      </Link>

      {hackathon.banner && (
        <div className="w-full overflow-hidden rounded-lg border border-border bg-slate-100">
          <img
            src={hackathon.banner}
            alt={`${hackathon.title} poster`}
            className="w-full max-h-72 object-cover"
          />
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white border border-border p-6 md:p-8 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
              {hackathon.title}
            </h1>
            <Badge variant={hackathon.status === 'ongoing' ? 'success' : hackathon.status === 'registration_open' || hackathon.status === 'published' ? 'primary' : 'default'}>
              {hackathon.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-semibold">{hackathon.tagline || 'Explore and innovate.'}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
            <Mail size={14} />
            <span>Questions: {hackathon.contactEmail}</span>
          </div>
        </div>

        {/* Dynamic CTA */}
        <div className="shrink-0 flex flex-col gap-2 w-full sm:w-auto">
          {user?.role === 'organizer' ? (
            <Link to={`/hackathons/${hackathon._id}/edit`}>
              <Button variant="secondary" className="w-full">
                Edit Event Configuration
              </Button>
            </Link>
          ) : registered ? (
            <div className="flex flex-col gap-2">
              <Link to={`/hackathons/${hackathon._id}/team`}>
                <Button variant="success" className="w-full">
                  Go to Team Arena
                </Button>
              </Link>
              <Link to={`/hackathons/${hackathon._id}/submit`}>
                <Button variant="primary" className="w-full">
                  Project Submission
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={handleRegister}
              isLoading={isRegistering}
              className="w-full"
              disabled={user?.role && user.role !== 'participant'}
            >
              {isAuthenticated ? 'Register Now' : 'Sign in to Register'}
            </Button>
          )}
          
          <Link to={`/hackathons/${hackathon._id}/leaderboard`} className="mt-2 text-center text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
            <Trophy size={14} /> View Leaderboard
          </Link>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Rules & Descriptions */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-secondary">Event Description</h3>
            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
              {hackathon.description}
            </p>
          </Card>

          {hackathon.rules && (
            <Card className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-secondary">Rules & Guidelines</h3>
              <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
                {hackathon.rules}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Timelines & Constraints */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-secondary">Timelines</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Registration Starts</span>
                <span className="text-secondary font-bold">{new Date(hackathon.registrationStart).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Registration Ends</span>
                <span className="text-secondary font-bold">{new Date(hackathon.registrationEnd).toLocaleString()}</span>
              </div>
              <div className="border-t border-border my-1" />
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Hackathon Begins</span>
                <span className="text-secondary font-bold">{new Date(hackathon.hackathonStart).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Hackathon Ends</span>
                <span className="text-secondary font-bold">{new Date(hackathon.hackathonEnd).toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-secondary">Team Guidelines</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Min Team Size:</span>
              <span className="text-secondary font-bold">{hackathon.minTeamSize} member(s)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Max Team Size:</span>
              <span className="text-secondary font-bold">{hackathon.maxTeamSize} member(s)</span>
            </div>
          </Card>

          {(hackathon.prizePool || (hackathon.prizes && hackathon.prizes.length > 0)) && (
            <Card className="flex flex-col gap-4">
              <h3 className="text-base font-bold text-secondary flex items-center gap-2">
                <Award size={16} /> Prizes
              </h3>
              {hackathon.prizePool && (
                <p className="text-sm text-secondary font-bold">Total pool: {hackathon.prizePool}</p>
              )}
              {hackathon.prizes?.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {hackathon.prizes.map((prize, index) => (
                    <li key={index} className="text-sm border-t border-border pt-3 first:border-0 first:pt-0">
                      <p className="font-bold text-secondary">{prize.title}</p>
                      {prize.value && <p className="text-primary font-semibold">{prize.value}</p>}
                      {prize.description && <p className="text-xs text-slate-500 mt-1">{prize.description}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HackathonDetail;
