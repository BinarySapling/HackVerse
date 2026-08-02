import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import { getApiList, getApiMeta } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, ExternalLink, Lock, Trophy, Mail } from 'lucide-react';

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
      toast.error(err.message || 'Failed to load organizer results.');
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
    <tr key={idx} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
      <td className="px-5 py-4 font-semibold text-secondary">
        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-white/[0.04] ring-1 ring-white/[0.06] text-secondary text-xs">
          {row.rank}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="font-semibold text-secondary tracking-tight">{row.teamName}</div>
        <div className="text-xs text-muted mt-0.5">Leader: {row.leader}</div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1 text-xs">
          <a
            href={row.githubRepo}
            target="_blank"
            rel="noreferrer"
            className="text-primary-soft hover:text-white transition-colors font-medium inline-flex items-center gap-1"
          >
            Repo <ExternalLink size={10} />
          </a>
          {row.demoUrl ? (
            <a
              href={row.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary-soft hover:text-white transition-colors font-medium inline-flex items-center gap-1"
            >
              Demo <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] text-muted">No demo</span>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1 text-xs">
          {row.presentationUrl ? (
            <a
              href={row.presentationUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary-soft hover:text-white transition-colors font-medium inline-flex items-center gap-1"
            >
              Slides <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] text-muted">No slides</span>
          )}
          {row.videoUrl ? (
            <a
              href={row.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary-soft hover:text-white transition-colors font-medium inline-flex items-center gap-1"
            >
              Video <ExternalLink size={10} />
            </a>
          ) : (
            <span className="text-[10px] text-muted">No video</span>
          )}
        </div>
      </td>
      <td className="px-5 py-4 text-xs text-muted">
        Inn {row.innovation} · UX {row.uiux ?? 0} · Tech {row.technical} · Pres {row.presentation}
      </td>
      <td className="px-5 py-4 font-semibold text-primary-soft text-sm tabular-nums">
        {row.averageScore}
      </td>
      <td className="px-5 py-4 text-xs">
        <Badge>{row.judgeCount} judge(s)</Badge>
      </td>
    </tr>
  );

  return (
    <div className="relative flex flex-col">
      <Link
        to="/dashboard/organizer"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary-soft w-fit mb-2 transition-colors"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <PageHeader
        eyebrow="Evaluation"
        title="Results & rankings"
        description="Invite judges, close evaluation, and announce winners."
        className="!pt-0"
        actions={
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-72">
            <Input
              id="search"
              placeholder="Search team name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" className="!px-3.5 shrink-0">
              <Search size={16} />
            </Button>
          </form>
        }
      />

      <SoftDivider />

      <div className="pt-8 pb-4 flex flex-col gap-8">
        <section className="flex flex-col lg:flex-row gap-6 lg:items-end justify-between">
          <form onSubmit={inviteJudge} className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
            <div className="flex-1">
              <Input
                id="judgeEmail"
                type="email"
                label="Invite judge by email"
                placeholder="judge@example.com"
                value={judgeEmail}
                onChange={(e) => setJudgeEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="gap-1.5 sm:mt-6"
              isLoading={actionLoading}
            >
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
              <Lock size={14} /> Close evaluation
            </Button>
            <Button
              className="gap-1.5"
              disabled={!metaFlags.evaluationClosed || metaFlags.winnersAnnounced || actionLoading}
              onClick={announceWinners}
            >
              <Trophy size={14} /> Announce winners
            </Button>
          </div>
        </section>

        {isLoading && results.length === 0 ? (
          <Loader size="lg" />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default OrganizerResults;
