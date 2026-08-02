import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import { getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const statusVariant = (status) => {
  if (status === 'approved') return 'success';
  if (status === 'under_review') return 'primary';
  if (status === 'rejected') return 'danger';
  return 'warning';
};

const formatStatus = (status) => (status || '').replaceAll('_', ' ');

const OrganizerSubmissions = () => {
  const { hackathonId } = useParams();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/hackathons/${hackathonId}/submissions`);
      setItems(getApiList(res));
    } catch (err) {
      toast.error(err.message || 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [hackathonId]);

  const review = async (id, status) => {
    try {
      await api.patch(`/submissions/${id}/review`, { status });
      toast.success(`Submission marked as ${formatStatus(status)}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div className="relative flex flex-col">
      <Link
        to="/organizer/hackathons"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-primary-soft w-fit mb-2 transition-colors"
      >
        <ArrowLeft size={14} /> Back to hackathons
      </Link>

      <PageHeader
        eyebrow="Event ops"
        title="Submissions"
        description="Review team projects and update submission status."
        className="!pt-0"
      />

      <SoftDivider />

      <div className="pt-8 pb-4">
        {isLoading ? (
          <Loader size="lg" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted py-10">No submissions yet.</p>
        ) : (
          <ul className="flex flex-col">
            {items.map((sub, index) => (
              <li key={sub._id}>
                {index > 0 && <div className="soft-row-divider" />}
                <div className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="min-w-0">
                    <p className="font-display font-semibold tracking-tight">
                      {sub.projectName || sub.team?.name || 'Untitled project'}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Team {sub.team?.name}
                      {sub.team?.leader && (
                        <>
                          {' '}
                          · {sub.team.leader.firstName} {sub.team.leader.lastName}
                        </>
                      )}
                    </p>
                    {sub.githubRepo && (
                      <a
                        href={sub.githubRepo}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary-soft hover:text-white mt-1 inline-block truncate max-w-full"
                      >
                        {sub.githubRepo}
                      </a>
                    )}
                    {sub.description && (
                      <p className="text-xs text-muted mt-2 line-clamp-2">{sub.description}</p>
                    )}
                    {(sub.problemStatement || sub.solution) && (
                      <p className="text-xs text-muted/80 mt-1 line-clamp-1">
                        {sub.problemStatement ? `Problem: ${sub.problemStatement}` : `Solution: ${sub.solution}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <Badge variant={statusVariant(sub.status)}>{formatStatus(sub.status)}</Badge>
                    <Button size="sm" variant="outline" onClick={() => review(sub._id, 'under_review')}>
                      Under review
                    </Button>
                    <Button size="sm" onClick={() => review(sub._id, 'approved')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => review(sub._id, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrganizerSubmissions;
