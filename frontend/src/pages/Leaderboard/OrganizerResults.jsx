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
import { ArrowLeft, Search, ExternalLink, ShieldCheck } from 'lucide-react';

const OrganizerResults = () => {
  const { hackathonId } = useParams();
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchResults = async (page = 1, searchQuery = '') => {
    setIsLoading(true);
    try {
      const response = await api.get(`/hackathons/${hackathonId}/results`, {
        params: { page, limit: 10, search: searchQuery },
      });
      setResults(getApiList(response));
      setPagination(getApiMeta(response, { page: 1, limit: 10, total: 0, pages: 1 }));
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

  const headers = [
    'Rank',
    'Team / Leader',
    'GitHub / Demo',
    'Docs / Video',
    'Averages (Inn/Tech/Pres)',
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
          <a href={row.demoUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
            Demo <ExternalLink size={10} />
          </a>
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
        {row.innovation} / {row.technical} / {row.presentation}
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
          <p className="text-xs text-slate-400">Detailed submissions overview with URLs, scores, and judge verification.</p>
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
