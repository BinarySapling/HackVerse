import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import { getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { ShieldX } from 'lucide-react';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/registrations/me');
      setRegistrations(getApiList(response));
    } catch {
      toast.error('Failed to load registrations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    try {
      await api.patch(`/registrations/${id}/cancel`);
      toast.success('Registration cancelled successfully.');
      fetchRegistrations();
    } catch (err) {
      toast.error(err.message || 'Cancellation failed.');
    }
  };

  return (
    <div className="relative flex flex-col">
      <PageHeader
        eyebrow="Participant"
        title="My registrations"
        description="Track and manage your registrations for active hackathons."
      />

      <SoftDivider />

      <div className="pt-8 pb-4">
        {isLoading ? (
          <Loader size="lg" />
        ) : registrations.length === 0 ? (
          <p className="text-sm text-muted py-10">
            You have not registered for any hackathons yet.
          </p>
        ) : (
          <ul className="flex flex-col">
            {registrations.map((reg, index) => (
              <li key={reg._id}>
                {index > 0 && <div className="soft-row-divider" />}
                <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Link
                      to={`/hackathons/${reg.hackathon?.slug || reg.hackathon?._id}`}
                      className="font-display font-semibold tracking-tight hover:text-primary-soft transition-colors"
                    >
                      {reg.hackathon?.title}
                    </Link>
                    <p className="text-xs text-muted mt-1.5">
                      Registered {new Date(reg.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={reg.status === 'registered' ? 'success' : 'danger'}>
                      {reg.status}
                    </Badge>
                    {reg.status === 'registered' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(reg._id)}
                        className="gap-1"
                      >
                        <ShieldX size={14} /> Cancel
                      </Button>
                    ) : (
                      <span className="text-xs text-muted">Inactive</span>
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

export default MyRegistrations;
