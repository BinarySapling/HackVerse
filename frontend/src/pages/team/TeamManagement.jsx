import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';
import { teamSchema, inviteSchema } from '../../validations/team';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { getApiData } from '../../utils/apiResponse';
import toast from 'react-hot-toast';
import { Users, Plus, UserMinus, ShieldAlert, ArrowLeft, Trash2, LogOut, Pencil, Check, X } from 'lucide-react';

const TeamManagement = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const {
    register: registerTeam,
    handleSubmit: handleTeamSubmit,
    formState: { errors: teamErrors },
    reset: resetTeam,
  } = useForm({
    resolver: zodResolver(teamSchema),
  });

  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    formState: { errors: inviteErrors },
    reset: resetInvite,
  } = useForm({
    resolver: zodResolver(inviteSchema),
  });

  const fetchTeamAndEvent = async () => {
    setIsLoading(true);
    try {
      const hRes = await api.get(`/hackathons/${hackathonId}`);
      setHackathon(getApiData(hRes));

      // Get My Team
      const response = await api.get(`/hackathons/${hackathonId}/my-team`);
      setTeam(getApiData(response));
    } catch (err) {
      // If 404/400 (no team formed yet), setTeam to null
      setTeam(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndEvent();
  }, [hackathonId]);

  useEffect(() => {
    if (team?.name) setTeamName(team.name);
  }, [team?.name]);

  const onCreateTeam = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post(`/hackathons/${hackathonId}/teams`, { name: data.name });
      toast.success('Team created successfully!');
      resetTeam();
      fetchTeamAndEvent();
    } catch (err) {
      toast.error(err.message || 'Failed to create team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInviteMember = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post(`/teams/${team._id}/invitations`, { email: data.email });
      toast.success('Invitation email sent!');
      resetInvite();
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      await api.patch(`/teams/${team._id}/remove-member`, { memberId });
      toast.success('Member removed successfully.');
      fetchTeamAndEvent();
    } catch (err) {
      toast.error(err.message || 'Failed to remove member.');
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await api.patch(`/teams/${team._id}/leave`);
      toast.success('You have left the team.');
      fetchTeamAndEvent();
    } catch (err) {
      toast.error(err.message || 'Failed to leave team.');
    }
  };

  const handleDeleteTeam = async () => {
    if (!window.confirm('Are you sure you want to delete this team? This is permanent.')) return;
    try {
      await api.delete(`/teams/${team._id}`);
      toast.success('Team deleted.');
      fetchTeamAndEvent();
    } catch (err) {
      toast.error(err.message || 'Failed to delete team.');
    }
  };

  const handleSaveTeamName = async () => {
    const trimmed = teamName.trim();
    if (!trimmed || trimmed === team.name) {
      setTeamName(team.name);
      setIsEditingName(false);
      return;
    }
    if (trimmed.length < 3) {
      toast.error('Team name must be at least 3 characters.');
      return;
    }

    setIsSavingName(true);
    try {
      await api.patch(`/teams/${team._id}`, { name: trimmed });
      toast.success('Team name updated.');
      setIsEditingName(false);
      fetchTeamAndEvent();
    } catch (err) {
      toast.error(err.message || 'Failed to update team name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const cancelNameEdit = () => {
    setTeamName(team?.name || '');
    setIsEditingName(false);
  };

  if (isLoading) return <Loader size="lg" />;

  const userId = String(user?.id || user?._id || '');
  const leaderId = String(team?.leader?._id || team?.leader || '');
  const isLeader = Boolean(team && userId && leaderId === userId);
  const submissionStart = hackathon
    ? new Date(hackathon.submissionStart || hackathon.hackathonStart)
    : null;
  const submissionEnd = hackathon
    ? new Date(hackathon.submissionDeadline || hackathon.hackathonEnd)
    : null;
  const now = new Date();
  const submissionOpen =
    submissionStart && submissionEnd && now >= submissionStart && now <= submissionEnd;
  const memberList = team?.members?.filter((member) => member._id !== team.leader?._id) || [];

  return (
    <div className="relative flex flex-col gap-8 max-w-4xl">
      <Link
        to="/dashboard/participant"
        className="text-muted hover:text-primary-soft flex items-center gap-1.5 text-xs transition-colors w-fit"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div>
        <p className="text-[11px] tracking-[0.32em] uppercase text-primary-soft/80 mb-3 font-medium">
          Team console
        </p>
        <h1 className="text-3xl font-display font-semibold tracking-tight">
          {hackathon?.title || 'Hackathon'}
        </h1>
        <p className="text-sm text-muted mt-2">Establish and manage your collaborative crew.</p>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      {!team ? (
        /* Create Team Form */
        <Card className="max-w-md mx-auto w-full flex flex-col gap-4">
          <div className="text-center">
            <Users size={36} className="text-primary mx-auto mb-3" />
            <h3 className="text-base font-bold text-secondary">Form a Team</h3>
            <p className="text-xs text-muted mt-1">
              Create a team to join collaboration challenges. You will act as the team leader.
            </p>
          </div>
          <form onSubmit={handleTeamSubmit(onCreateTeam)} className="flex flex-col gap-4">
            <Input
              id="name"
              label="Team Name"
              placeholder="e.g. Code Knights"
              error={teamErrors.name?.message}
              {...registerTeam('name')}
            />
            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Create Team
            </Button>
          </form>
        </Card>
      ) : (
        /* Team Dashboard Panel */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Members list */}
          <Card className="md:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
              <div className="min-w-0 flex-1">
                {isLeader && isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      maxLength={50}
                      className="flex-1 min-w-0 h-9 px-3 rounded-lg bg-white/[0.03] text-sm text-secondary ring-1 ring-white/[0.08] focus:outline-none focus:ring-primary/50"
                      autoFocus
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1 shrink-0"
                      onClick={handleSaveTeamName}
                      isLoading={isSavingName}
                    >
                      <Check size={14} />
                    </Button>
                    <Button variant="outline" size="sm" className="shrink-0" onClick={cancelNameEdit}>
                      <X size={14} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-secondary truncate">{team.name}</h3>
                    {isLeader && (
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="text-muted hover:text-primary-soft transition-colors"
                        aria-label="Edit team name"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                )}
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                  Capacity: {team.members?.length || 0} / {team.maxMembers || 4} Members
                </span>
              </div>
              <div className="flex gap-2">
                {isLeader ? (
                  <Button variant="danger" size="sm" className="gap-1" onClick={handleDeleteTeam}>
                    <Trash2 size={14} /> Delete
                  </Button>
                ) : (
                  <Button variant="danger" size="sm" className="gap-1" onClick={handleLeaveTeam}>
                    <LogOut size={14} /> Leave
                  </Button>
                )}
              </div>
            </div>

            {/* List members */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Members</h4>
              <div className="divide-y divide-white/[0.06]">
                {/* Leader */}
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/15 text-primary font-bold rounded-full flex items-center justify-center text-xs">
                      {team.leader?.firstName ? team.leader.firstName[0].toUpperCase() : 'L'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary">
                        {team.leader?.firstName} {team.leader?.lastName}
                      </p>
                      <p className="text-xs text-muted">{team.leader?.email}</p>
                    </div>
                  </div>
                  <Badge variant="warning">Leader</Badge>
                </div>

                {/* Other Members */}
                {memberList.map((member) => (
                  <div key={member._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-hoverSurface text-muted font-bold rounded-full flex items-center justify-center text-xs">
                        {member.firstName ? member.firstName[0].toUpperCase() : 'M'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-secondary">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted">{member.email}</p>
                      </div>
                    </div>
                    {isLeader && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={async () => {
                            try {
                              await api.patch(`/teams/${team._id}/transfer-leadership`, {
                                newLeaderId: member._id,
                              });
                              toast.success('Leadership transferred');
                              fetchTeamAndEvent();
                            } catch (err) {
                              toast.error(err.message || 'Transfer failed');
                            }
                          }}
                        >
                          Make leader
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-danger/15 border-red-200 gap-1"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <UserMinus size={12} /> Kick
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Sidebar Invite and Submission Panel */}
          <div className="flex flex-col gap-6">
            {/* Invite form */}
            {isLeader && (team.members?.length || 0) < (team.maxMembers || 4) && (
              <Card className="flex flex-col gap-4">
                <h4 className="text-sm font-bold text-secondary">Invite Team Member</h4>
                <form onSubmit={handleInviteSubmit(onInviteMember)} className="flex flex-col gap-3">
                  <Input
                    id="email"
                    type="email"
                    placeholder="participant@email.com"
                    error={inviteErrors.email?.message}
                    {...registerInvite('email')}
                  />
                  <Button type="submit" variant="primary" className="w-full gap-1.5" isLoading={isSubmitting}>
                    <Plus size={16} /> Send Invite
                  </Button>
                </form>
              </Card>
            )}

            {/* Submission shortcut — only while window is open */}
            {submissionOpen ? (
              <Card className="flex flex-col gap-4 text-center">
                <h4 className="text-sm font-bold text-secondary">Project Submission</h4>
                <p className="text-xs text-muted">
                  Ready to submit? Leader must register and provide repository details.
                </p>
                <Link to={`/hackathons/${hackathonId}/submit`}>
                  <Button variant="primary" className="w-full">
                    Go to Submissions
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="flex flex-col gap-2 text-center">
                <h4 className="text-sm font-bold text-secondary">Project Submission</h4>
                <p className="text-xs text-muted">
                  {submissionStart && now < submissionStart
                    ? `Opens ${submissionStart.toLocaleString()}`
                    : submissionEnd && now > submissionEnd
                      ? 'Submission window is closed.'
                      : 'Submission window unavailable.'}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
