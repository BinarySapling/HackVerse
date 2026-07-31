import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiData, getApiList } from '../../utils/apiResponse';
import { ClipboardCheck, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const JudgeDashboard = () => {
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
      } catch (err) {
        toast.error('Failed to load judge evaluations.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvaluations();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">Judge Assessment Center</h2>
          <p className="text-xs text-slate-400">Score project submissions across designated hackathons.</p>
        </div>
        <Link to="/judge/hackathons">
          <Button variant="primary" className="gap-2">
            <ClipboardCheck size={16} /> Evaluate Submissions
          </Button>
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Assigned Hackathons</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.assignedHackathons ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Pending Evaluations</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.pendingEvaluations ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-slate-400 font-semibold uppercase">Completed</div>
            <div className="text-2xl font-bold text-secondary mt-1">{stats.completedEvaluations ?? 0}</div>
          </Card>
        </div>
      )}

      {isLoading ? (
        <Loader size="lg" />
      ) : (
        <div className="flex flex-col gap-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">My Evaluation History</h3>
          {evaluations.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-sm text-slate-500">No evaluations submitted yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {evaluations.map((ev) => (
                <Card key={ev._id} className="flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-secondary">
                        Submission: {ev.submission?.team?.name || 'Assigned Project'}
                      </h4>
                      <Badge variant="success">Score: {ev.totalScore}/60</Badge>
                    </div>
                    <p className="text-xs text-slate-400 italic">
                      Remarks: &quot;{ev.remarks || 'No remarks left'}&quot;
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2 font-medium">
                      <span>Inn: {ev.innovationScore}</span>
                      <span>UX: {ev.uiuxScore ?? 0}</span>
                      <span>Tech: {ev.technicalScore}</span>
                      <span>Pres: {ev.presentationScore}</span>
                      <span>Code: {ev.codeQualityScore ?? 0}</span>
                      <span>Solve: {ev.problemSolvingScore ?? 0}</span>
                    </div>
                  </div>
                  <Link to={`/judge/submissions/${ev.submission?._id || ev.submission}/evaluate`} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                    <Award size={12} /> Edit Evaluation
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
