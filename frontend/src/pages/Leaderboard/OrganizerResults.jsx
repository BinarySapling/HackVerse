import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import { getApiList, getApiMeta } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, ExternalLink, ShieldCheck, Lock, Trophy, Mail } from 'lucide-react';

const OrganizerResults = () => {
  const { hackathonId } = useParams();
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [judgeEmail, setJudgeEmail] = useState('');
  const [metaFlags, setMetaFlags] = useState({ evaluationClosed: false, winnersAnnounced: false });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchResults = async (page = 1, searchQuery = '') => {
    setIsLoading(true);
    try {
      const response = await api.get(`/hackathons/${hackathonId}/results`, {
        params: { page, limit: 10, search: searchQuery },
      });
      setResults(getApiList(response));
      const meta = getApiMeta(response, { page: 1, limit: 10, total: 0, pages: 1 });
      setPagination(meta);
      setMetaFlags({
        evaluationClosed: Boolean(meta.evaluationClosed),
        winnersAnnounced: Boolean(meta.winnersAnnounced),
      });
    } catch (err) {
      toast.error('Failed to load organizer results.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(1, '');
  }, [hackathonId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResults(1, search);
  };

  const inviteJudge = async (e) => {
    e.preventDefault();
    if (!judgeEmail.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/hackathons/${hackathonId}/judges/invite`, { email: judgeEmail.trim() });
      toast.success('Judge invitation sent');
      setJudgeEmail('');
    } catch (err) {
      toast.error(err.message || 'Failed to invite judge');
    } finally {
      setActionLoading(false);
    }
  };

  const closeEvaluation = async () => {
    if (!window.confirm('Close evaluation? Judges will no longer be able to edit scores.')) return;
    setActionLoading(true);
    try {
      await api.post(`/hackathons/${hackathonId}/close-evaluation`);
      toast.success('Evaluation closed');
      fetchResults(pagination.page, search);
      setMetaFlags((prev) => ({ ...prev, evaluationClosed: true }));
    } catch (err) {
      toast.error(err.message || 'Failed to close evaluation');
    } finally {
      setActionLoading(false);
    }
  };

  const announceWinners = async () => {
    if (!window.confirm('Announce top 5 winners and send emails?')) return;
    setActionLoading(true);
    try {
      await api.post(`/hackathons/${hackathonId}/announce-winners`);
      toast.success('Winners announced');
      setMetaFlags((prev) => ({ ...prev, winnersAnnounced: true }));
      fetchResults(pagination.page, search);
    } catch (err) {
      toast.error(err.message || 'Failed to announce winners');
    } finally {
      setActionLoading(false);
    }
  };

  const headers = [
    'Rank',
    'Team / Leader',
    'GitHub / Demo',
    'Docs / Video',
    'Averages',
    'Total Score',
    'Judges',
  ];

  const renderRow = (row, idx) => (
    <tr key={idx} className="hover:bg-hoverSurface transition-colors">
      <td className="px-5 py-4 font-bold text-secondary">
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-700 text-xs">
          {row.rank}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="font-semibold text-secondary">{row.teamName}</div>
        <div className="text-xs text-slate-400 font-medium">Leader: {row.leader}</div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1 text-xs">
          <a href={row.githubRepo} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
            Repo <ExternalLink size={10} />
          </a>
          {row.demoUrl ? (
            <a href={row.demoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
              Demo <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">No Demo</span>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1 text-xs">
          {row.presentationUrl ? (
            <a href={row.presentationUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
              Slides <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">No Slides</span>
          )}
          {row.videoUrl ? (
            <a href={row.videoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
              Video <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">No Video</span>
          )}
        </div>
      </td>
      <td className="px-5 py-4 text-xs text-slate-500 font-semibold">
        Inn {row.innovation} · UX {row.uiux ?? 0} · Tech {row.technical} · Pres {row.presentation}
      </td>
      <td className="px-5 py-4 font-extrabold text-primary text-sm">
        {row.averageScore}
      </td>
      <td className="px-5 py-4 text-xs">
        <Badge variant="default">{row.judgeCount} judge(s)</Badge>
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-6">
      <Link to="/dashboard/organizer" className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-xs font-semibold select-none">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" /> Evaluation Ledger & Rankings
          </h2>
          <p className="text-xs text-slate-400">Invite judges, close evaluation, and announce winners.</p>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-72">
          <Input
            id="search"
            placeholder="Search team name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="primary">
            <Search size={16} />
          </Button>
        </form>
      </div>

      <Card className="flex flex-col md:flex-row gap-4 md:items-end justify-between">
        <form onSubmit={inviteJudge} className="flex flex-col sm:flex-row gap-2 flex-1">
          <Input
            id="judgeEmail"
            type="email"
            label="Invite Judge by Email"
            placeholder="judge@example.com"
            value={judgeEmail}
            onChange={(e) => setJudgeEmail(e.target.value)}
          />
          <Button type="submit" variant="outline" className="gap-1.5 sm:mt-6" isLoading={actionLoading}>
            <Mail size={14} /> Invite
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="gap-1.5"
            disabled={metaFlags.evaluationClosed || actionLoading}
            onClick={closeEvaluation}
          >
            <Lock size={14} /> Close Evaluation
          </Button>
          <Button
            variant="primary"
            className="gap-1.5"
            disabled={!metaFlags.evaluationClosed || metaFlags.winnersAnnounced || actionLoading}
            onClick={announceWinners}
          >
            <Trophy size={14} /> Announce Winners
          </Button>
        </div>
      </Card>

      <Table
        headers={headers}
        data={results}
        renderRow={renderRow}
        isLoading={isLoading}
        emptyState="No evaluated project submissions matched your query."
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={(page) => fetchResults(page, search)}
      />
    </div>
  );
};

export default OrganizerResults;
