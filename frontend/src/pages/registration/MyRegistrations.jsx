import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
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
    } catch (err) {
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

  const getStatusBadgeVariant = (status) => {
    return status === 'registered' ? 'success' : 'danger';
  };

  const headers = ['Hackathon', 'Registered On', 'Status', 'Actions'];

  const renderRow = (reg) => (
    <tr key={reg._id} className="hover:bg-hoverSurface transition-colors">
      <td className="px-5 py-4 font-semibold text-secondary">
        <Link to={`/hackathons/${reg.hackathon?.slug}`} className="hover:underline text-primary">
          {reg.hackathon?.title}
        </Link>
      </td>
      <td className="px-5 py-4 text-slate-500">
        {new Date(reg.createdAt).toLocaleDateString()}
      </td>
      <td className="px-5 py-4">
        <Badge variant={getStatusBadgeVariant(reg.status)}>
          {reg.status}
        </Badge>
      </td>
      <td className="px-5 py-4">
        {reg.status === 'registered' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancel(reg._id)}
            className="gap-1 px-2.5 py-1.5"
          >
            <ShieldX size={14} /> Cancel
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Inactive</span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-secondary">My Registrations</h2>
        <p className="text-xs text-slate-400">Track and manage your registrations for active hackathons.</p>
      </div>

      <Table
        headers={headers}
        data={registrations}
        renderRow={renderRow}
        isLoading={isLoading}
        emptyState="You have not registered for any hackathons yet."
      />
    </div>
  );
};

export default MyRegistrations;
