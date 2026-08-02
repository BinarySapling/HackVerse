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

const OrganizerRegistrations = () => {
  const { hackathonId } = useParams();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/hackathons/${hackathonId}/registrations`);
      setItems(getApiList(res));
    } catch (err) {
      toast.error(err.message || 'Failed to load registrations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [hackathonId]);

  const review = async (id, decision) => {
    try {
      await api.patch(`/registrations/${id}/review`, { decision });
      toast.success(`Registration ${decision}d`);
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
        title="Registrations"
        description="Approve or reject pending participants."
        className="!pt-0"
      />

      <SoftDivider />

      <div className="pt-8 pb-4">
        {isLoading ? (
          <Loader size="lg" />
        ) : items.length === 0 ? (
          <p className="text-sm text-muted py-10">No registrations yet.</p>
        ) : (
          <ul className="flex flex-col">
            {items.map((reg, index) => (
              <li key={reg._id}>
                {index > 0 && <div className="soft-row-divider" />}
                <div className="py-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div>
                    <p className="font-display font-semibold tracking-tight">
                      {reg.user?.firstName} {reg.user?.lastName}
                    </p>
                    <p className="text-xs text-muted mt-1">{reg.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      variant={
                        reg.status === 'registered'
                          ? 'success'
                          : reg.status === 'pending'
                            ? 'warning'
                            : 'default'
                      }
                    >
                      {reg.status}
                    </Badge>
                    {reg.status === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => review(reg._id, 'approve')}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => review(reg._id, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
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

export default OrganizerRegistrations;
