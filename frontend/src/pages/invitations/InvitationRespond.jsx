import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../config/axios';
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
    <div className="min-h-[70vh] flex items-center justify-center px-4 page-glow">
      <div className="w-full max-w-md">
        <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-4 font-medium">
          Invitation
        </p>
        <h1 className="text-3xl font-display font-semibold tracking-tight">
          {type === 'team' ? 'Team invitation' : 'Judge invitation'}
        </h1>
        <p className="text-sm text-muted mt-3 leading-relaxed">
          Accept to join automatically, or decline to ignore this invite.
        </p>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent my-8" />

        {!token ? (
          <p className="text-sm text-danger">Invalid or missing invitation token.</p>
        ) : (
          <div className="flex gap-3">
            <Button disabled={loading} onClick={() => respond(true)} className="flex-1">
              Accept
            </Button>
            <Button
              disabled={loading}
              variant="outline"
              onClick={() => respond(false)}
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationRespond;
