import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../config/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const InvitationRespond = ({ type }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const endpoint = type === 'team' ? '/team-invitations/respond' : '/judge-invitations/respond';

  const respond = async (accepted) => {
    if (!token) {
      toast.error('Invitation token is missing');
      return;
    }
    if (!user) {
      toast.error('Please log in to respond to this invitation');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setLoading(true);
    try {
      await api.post(endpoint, { token, accepted });
      toast.success(accepted ? 'Invitation accepted' : 'Invitation declined');
      navigate(type === 'team' ? '/dashboard/participant' : '/dashboard/judge');
    } catch (err) {
      toast.error(err.message || 'Failed to respond to invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10">
      <Card className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-secondary">
            {type === 'team' ? 'Team Invitation' : 'Judge Invitation'}
          </h1>
          <p className="text-sm text-slate-500">
            Accept to join automatically, or decline to ignore this invite.
          </p>
        </div>

        {!token ? (
          <p className="text-sm text-red-500">Invalid or missing invitation token.</p>
        ) : (
          <div className="flex gap-3">
            <Button disabled={loading} onClick={() => respond(true)} className="flex-1">
              Accept
            </Button>
            <Button disabled={loading} variant="outline" onClick={() => respond(false)} className="flex-1">
              Decline
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvitationRespond;
