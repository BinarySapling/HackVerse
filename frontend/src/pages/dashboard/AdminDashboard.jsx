import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import PageHeader, { SoftDivider } from '../../components/ui/PageHeader';
import { Calendar, FileText, LayoutDashboard, Pencil, Trash2, Users } from 'lucide-react';
import { getApiData, getApiList } from '../../utils/apiResponse';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'participant', label: 'Participant' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'judge', label: 'Judge' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_FILTERS = [
  { key: '', label: 'All' },
  { key: 'organizer', label: 'Organizers' },
  { key: 'judge', label: 'Judges' },
  { key: 'participant', label: 'Participants' },
  { key: 'admin', label: 'Admins' },
];

const TABS = [
  { key: 'hackathons', label: 'Hackathons' },
  { key: 'users', label: 'Users' },
  { key: 'teams', label: 'Teams' },
  { key: 'submissions', label: 'Submissions' },
];

const userId = (u) => u._id || u.id;

const AdminDashboard = () => {
  const [tab, setTab] = useState('hackathons');
  const [hackathons, setHackathons] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', role: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      const data = getApiData(response) || {};
      setStats({
        totalHackathons: data.totalHackathons ?? 0,
        registeredTeams: data.registeredTeams ?? 0,
        submissions: data.submissions ?? 0,
        totalUsers: data.totalUsers ?? 0,
      });
    } catch {
      toast.error('Failed to load platform stats.');
    }
  };

  const fetchHackathons = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/hackathons?includeDrafts=true');
      setHackathons(getApiList(response));
    } catch {
      toast.error('Failed to load hackathons.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const response = await api.get('/users', { params });
      setUsers(getApiList(response));
    } catch (err) {
      toast.error(err.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/teams');
      setTeams(getApiList(response));
    } catch {
      toast.error('Failed to load teams.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/submissions');
      setSubmissions(getApiList(response));
    } catch {
      toast.error('Failed to load submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === 'hackathons') fetchHackathons();
    else if (tab === 'users') fetchUsers();
    else if (tab === 'teams') fetchTeams();
    else if (tab === 'submissions') fetchSubmissions();
  }, [tab, roleFilter]);

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: u.role || 'participant',
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setIsSaving(true);
    try {
      await api.patch(`/users/${userId(editUser)}`, editForm);
      toast.success('User updated.');
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHackathon = async (id) => {
    if (!window.confirm('Delete this hackathon?')) return;
    try {
      await api.delete(`/hackathons/${id}`);
      toast.success('Hackathon deleted.');
      fetchHackathons();
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  };

  const handleBlock = async (id, block) => {
    try {
      await api.patch(`/users/${id}/${block ? 'block' : 'unblock'}`);
      toast.success(block ? 'User blocked' : 'User unblocked');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const statItems = [
    { label: 'Hackathons', value: stats?.totalHackathons ?? 0, icon: LayoutDashboard },
    { label: 'Teams', value: stats?.registeredTeams ?? 0, icon: Users },
    { label: 'Submissions', value: stats?.submissions ?? 0, icon: FileText },
    { label: 'Users', value: stats?.totalUsers ?? 0, icon: Users },
  ];

  const maxBar = Math.max(
    stats?.registeredTeams ?? 0,
    stats?.submissions ?? 0,
    stats?.totalUsers ?? 0,
    1
  );

  const barItems = [
    { label: 'Teams', value: stats?.registeredTeams ?? 0, color: 'bg-primary/70' },
    { label: 'Submissions', value: stats?.submissions ?? 0, color: 'bg-primary-soft/60' },
    { label: 'Users', value: stats?.totalUsers ?? 0, color: 'bg-[#c4a8ff]/50' },
  ];

  return (
    <div className="relative flex flex-col">
      <PageHeader
        eyebrow="Admin console"
        title="Platform control"
        description="Manage users, teams, and hackathons across HackVerse."
      />

      <SoftDivider />

      <section className="pt-8 pb-6">
        <p className="text-[11px] tracking-[0.28em] uppercase text-muted/70 mb-8">At a glance</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
          {statItems.map((item) => (
            <div key={item.label}>
              <div className="flex items-center gap-2 mb-3">
                <item.icon size={13} className="text-primary-soft/70" strokeWidth={2} />
                <span className="text-[11px] tracking-[0.16em] uppercase text-muted/75">
                  {item.label}
                </span>
              </div>
              <p className="text-[2rem] sm:text-[2.35rem] font-display font-semibold tabular-nums tracking-tight leading-none text-secondary">
                {stats === null ? '—' : item.value}
              </p>
            </div>
          ))}
        </div>

        {stats && (
          <div className="mt-10 flex flex-col gap-4 max-w-md">
            <p className="text-[11px] tracking-[0.2em] uppercase text-muted/60">Platform mix</p>
            {barItems.map((bar) => (
              <div key={bar.label} className="flex items-center gap-4">
                <span className="text-xs text-muted w-24 shrink-0">{bar.label}</span>
                <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                    style={{ width: `${(bar.value / maxBar) * 100}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted w-8 text-right">{bar.value}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <SoftDivider />

      <div className="pt-8 pb-4 flex flex-col gap-8">
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`px-5 h-10 rounded-full text-sm font-medium transition-all duration-300 ${
                tab === key
                  ? 'bg-primary/90 text-white shadow-[0_0_24px_rgba(124,58,237,0.28)]'
                  : 'text-muted hover:text-secondary bg-white/[0.03] ring-1 ring-white/[0.06]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Loader size="lg" />
        ) : tab === 'hackathons' ? (
          hackathons.length === 0 ? (
            <p className="text-sm text-muted py-10">No hackathons available yet.</p>
          ) : (
            <ul className="flex flex-col">
              {hackathons.map((h, index) => (
                <li key={h._id}>
                  {index > 0 && <div className="soft-row-divider" />}
                  <div className="py-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5 mb-1">
                        <h3 className="font-display font-semibold tracking-tight">{h.title}</h3>
                        <Badge>{h.status}</Badge>
                      </div>
                      <p className="text-xs text-muted line-clamp-1">{h.tagline || 'No tagline'}</p>
                      <p className="text-xs text-muted mt-2 inline-flex items-center gap-1.5">
                        <Calendar size={12} className="opacity-70" />
                        Starts {new Date(h.hackathonStart).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Link
                        to={`/hackathons/${h.slug || h._id}`}
                        className="text-sm text-primary-soft hover:text-white transition-colors"
                      >
                        View
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteHackathon(h._id)}
                        className="!px-3"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : tab === 'users' ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTERS.map(({ key, label }) => (
                <button
                  key={key || 'all'}
                  type="button"
                  onClick={() => setRoleFilter(key)}
                  className={`px-4 h-8 rounded-full text-xs font-medium transition-all duration-300 ${
                    roleFilter === key
                      ? 'bg-primary/80 text-white'
                      : 'text-muted hover:text-secondary bg-white/[0.03] ring-1 ring-white/[0.06]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchUsers();
              }}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="flex-1">
                <Input
                  id="search"
                  placeholder="Search by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>

            {users.length === 0 ? (
              <p className="text-sm text-muted py-6">No users found.</p>
            ) : (
              <ul className="flex flex-col">
                {users.map((u, index) => (
                  <li key={userId(u)}>
                    {index > 0 && <div className="soft-row-divider" />}
                    <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-display font-semibold tracking-tight">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-muted mt-1">
                          {u.email} · {u.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={u.isActive ? 'success' : 'danger'}>
                          {u.isActive ? 'active' : 'blocked'}
                        </Badge>
                        <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
                          <Pencil size={14} className="mr-1" />
                          Edit
                        </Button>
                        {u.role !== 'admin' && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleBlock(userId(u), u.isActive)}
                            >
                              {u.isActive ? 'Block' : 'Unblock'}
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteUser(userId(u))}
                            >
                              Delete
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
        ) : tab === 'teams' ? (
          teams.length === 0 ? (
            <p className="text-sm text-muted py-10">No teams registered yet.</p>
          ) : (
            <ul className="flex flex-col">
              {teams.map((t, index) => (
                <li key={t.id}>
                  {index > 0 && <div className="soft-row-divider" />}
                  <div className="py-5 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold tracking-tight">{t.name}</p>
                      <p className="text-xs text-muted mt-1">
                        {t.hackathonTitle} · Leader: {t.leader}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted tabular-nums">
                        {t.memberCount} member{t.memberCount !== 1 ? 's' : ''}
                      </span>
                      {t.hackathonSlug && (
                        <Link
                          to={`/hackathons/${t.hackathonSlug}`}
                          className="text-sm text-primary-soft hover:text-white transition-colors"
                        >
                          View event
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted py-10">No submissions yet.</p>
        ) : (
          <ul className="flex flex-col">
            {submissions.map((s, index) => (
              <li key={s.id}>
                {index > 0 && <div className="soft-row-divider" />}
                <div className="py-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-1">
                      <p className="font-display font-semibold tracking-tight">{s.projectName}</p>
                      <Badge>{s.status?.replaceAll('_', ' ')}</Badge>
                    </div>
                    <p className="text-xs text-muted">
                      {s.teamName} · {s.hackathonTitle}
                    </p>
                  </div>
                  {s.hackathonSlug && (
                    <Link
                      to={`/hackathons/${s.hackathonSlug}`}
                      className="text-sm text-primary-soft hover:text-white transition-colors shrink-0"
                    >
                      View event
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit user"
        size="sm"
      >
        <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
          <Input
            id="edit-firstName"
            label="First name"
            value={editForm.firstName}
            onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
            required
          />
          <Input
            id="edit-lastName"
            label="Last name"
            value={editForm.lastName}
            onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
            required
          />
          <Select
            id="edit-role"
            label="Role"
            options={ROLE_OPTIONS}
            value={editForm.role}
            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
            placeholder={null}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
