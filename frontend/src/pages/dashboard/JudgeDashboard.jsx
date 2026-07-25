import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { getApiList } from '../../utils/apiResponse';
import { ClipboardCheck, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const JudgeDashboard = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluations = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/evaluations/me');
        setEvaluations(getApiList(response));
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
                      <Badge variant="success">Score: {ev.totalScore}/30</Badge>
                    </div>
                    <p className="text-xs text-slate-400 italic">
                      Remarks: "{ev.remarks || 'No remarks left'}"
                    </p>
                    <div className="flex gap-4 text-xs text-slate-500 mt-2 font-medium">
                      <span>Inn: {ev.innovationScore}/10</span>
                      <span>Tech: {ev.technicalScore}/10</span>
                      <span>Pres: {ev.presentationScore}/10</span>
                    </div>
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

export default JudgeDashboard;
