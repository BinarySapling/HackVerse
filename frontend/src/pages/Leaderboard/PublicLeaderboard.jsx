import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { getApiData, getApiList, getApiMeta } from '../../utils/apiResponse';
import { Award, ArrowLeft, Eye, Star } from 'lucide-react';

const PublicLeaderboard = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [myResult, setMyResult] = useState(null);
  const [isMyResultOpen, setIsMyResultOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMyResultLoading, setIsMyResultLoading] = useState(false);

  const fetchLeaderboard = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/hackathons/${hackathonId}/leaderboard`, {
        params: { page, limit: 10 },
      });
      setLeaderboard(getApiList(response));
      setPagination(getApiMeta(response, { page: 1, limit: 10, total: 0, pages: 1 }));
    } catch (err) {
      toast.error('Failed to load leaderboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(1);
  }, [hackathonId]);

  const handleFetchMyResult = async () => {
    setIsMyResultLoading(true);
    try {
      const response = await api.get(`/hackathons/${hackathonId}/my-result`);
      setMyResult(getApiData(response, response));
      setIsMyResultOpen(true);
    } catch (err) {
      toast.error(err.message || 'You must be a team leader with evaluated submissions.');
    } finally {
      setIsMyResultLoading(false);
    }
  };

  const headers = ['Rank', 'Team Name', 'Team Leader', 'Innovation', 'Technical', 'Presentation', 'Total Score', 'Judges'];

  const renderRow = (row, idx) => (
    <tr key={idx} className="hover:bg-hoverSurface transition-colors">
      <td className="px-5 py-4 font-bold text-secondary">
        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs ${
          row.rank === 1 ? 'bg-primary/15 text-primary border border-primary/30' :
          row.rank === 2 ? 'bg-hoverSurface text-secondary' :
          row.rank === 3 ? 'bg-warning/15 text-warning border border-orange-200' : 'text-muted'
        }`}>
          {row.rank}
        </span>
      </td>
      <td className="px-5 py-4 font-semibold text-secondary">{row.teamName}</td>
      <td className="px-5 py-4 text-muted">{row.leader}</td>
      <td className="px-5 py-4 text-muted font-medium">{row.innovation}/10</td>
      <td className="px-5 py-4 text-muted font-medium">{row.technical}/10</td>
      <td className="px-5 py-4 text-muted font-medium">{row.presentation}/10</td>
      <td className="px-5 py-4 font-bold text-primary">{row.averageScore}</td>
      <td className="px-5 py-4">
        <Badge variant="default">{row.judgeCount} judge(s)</Badge>
      </td>
    </tr>
  );

  return (
    <div className="relative flex flex-col gap-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-3 font-medium">
            Rankings
          </p>
          <h1 className="text-3xl font-display font-semibold tracking-tight">Leaderboard</h1>
          <p className="text-sm text-muted mt-2">
            Deterministic ranks based on evaluated average scores.
          </p>
        </div>

        {user?.role === 'participant' && (
          <Button
            variant="outline"
            onClick={handleFetchMyResult}
            isLoading={isMyResultLoading}
            className="gap-1.5 shrink-0"
          >
            <Eye size={16} /> View my team result
          </Button>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <Table
        headers={headers}
        data={leaderboard}
        renderRow={renderRow}
        isLoading={isLoading}
        emptyState="No evaluated project submissions on the leaderboard yet."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(page) => fetchLeaderboard(page)}
      />

      {/* My Team Result Modal */}
      <Modal
        isOpen={isMyResultOpen}
        onClose={() => setIsMyResultOpen(false)}
        title="My Team Evaluation Summary"
        size="lg"
      >
        {myResult && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-bold text-lg text-secondary">
                  {myResult.team?.name || 'My Team'}
                </h3>
                <span className="text-xs text-muted">Object ID: {myResult.team?.id || myResult.team}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-muted uppercase font-semibold">Rank</span>
                <span className="text-2xl font-extrabold text-primary">#{myResult.rank}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/[0.03] ring-1 ring-white/[0.06] p-4 rounded-2xl text-center">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase">Avg Total</span>
                <p className="text-lg font-bold text-primary">{myResult.averageScore}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase">Avg Innovation</span>
                <p className="text-base font-semibold text-secondary">{myResult.innovation}/10</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase">Avg Technical</span>
                <p className="text-base font-semibold text-secondary">{myResult.technical}/10</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted uppercase">Avg Presentation</span>
                <p className="text-base font-semibold text-secondary">{myResult.presentation}/10</p>
              </div>
            </div>

            {/* Individual Evaluations */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Judge Scorecards</h4>
              <div className="flex flex-col gap-4">
                {myResult.evaluations?.map((ev, idx) => (
                  <div key={idx} className="ring-1 ring-white/[0.06] p-4 rounded-2xl flex flex-col gap-2 bg-white/[0.02]">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-muted">Judge card {idx + 1}</span>
                      <Badge variant="success">Total: {ev.totalScore}/30</Badge>
                    </div>
                    <p className="text-xs text-muted italic">"{ev.remarks || 'No remarks provided.'}"</p>
                    <div className="flex gap-4 text-[10px] font-bold text-muted mt-1 uppercase">
                      <span>Innovation: {ev.innovationScore}/10</span>
                      <span>Technical: {ev.technicalScore}/10</span>
                      <span>Presentation: {ev.presentationScore}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PublicLeaderboard;
