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
import { ClipboardCheck, Calendar, Search } from 'lucide-react';

const AssignedHackathons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState('');

  useEffect(() => {
    const fetchAssigned = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/hackathons');
        const allEvents = getApiList(response);
        
        // Filter hackathons where judge is assigned
        const assigned = allEvents.filter(
          (h) => h.judges && h.judges.some((j) => (j._id || j) === user?.id)
        );
        setHackathons(assigned);
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
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-secondary">My Assigned Events</h2>
        <p className="text-xs text-slate-400">View hackathons you are assigned to judge, or evaluate a specific submission.</p>
      </div>

      {/* Enter Submission ID section */}
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
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Assigned Hackathons</h3>
          {hackathons.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-sm text-slate-500">You are not assigned to judge any active hackathons.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hackathons.map((h) => (
                <Card key={h._id} className="flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-base text-secondary">{h.title}</h4>
                      <Badge variant="primary">{h.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500">{h.tagline || 'Explore and innovate.'}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-medium">
                      <Calendar size={14} />
                      <span>Starts: {new Date(h.hackathonStart).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-4 text-center">
                    <Link to={`/hackathons/${h._id}/leaderboard`} className="text-xs text-primary font-bold hover:underline">
                      View Live Leaderboard
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignedHackathons;
