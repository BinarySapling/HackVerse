import Team from '../models/Team.js';
import Submission from '../models/Submission.js';

export const listAllTeams = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  const [teams, total] = await Promise.all([
    Team.find(filter)
      .populate('hackathon', 'title slug')
      .populate('leader', 'firstName lastName email')
      .select('name hackathon leader members createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Team.countDocuments(filter),
  ]);

  const data = teams.map((t) => ({
    id: t._id,
    name: t.name,
    hackathonTitle: t.hackathon?.title || '—',
    hackathonSlug: t.hackathon?.slug || null,
    leader: t.leader
      ? `${t.leader.firstName} ${t.leader.lastName}`
      : '—',
    memberCount: t.members?.length ?? 0,
  }));

  return {
    teams: data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  };
};

export const listAllSubmissions = async (query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };

  const [submissions, total] = await Promise.all([
    Submission.find(filter)
      .populate('team', 'name')
      .populate('hackathon', 'title slug')
      .select('projectName team hackathon status submittedAt')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Submission.countDocuments(filter),
  ]);

  const data = submissions.map((s) => ({
    id: s._id,
    projectName: s.projectName || 'Untitled',
    teamName: s.team?.name || '—',
    hackathonTitle: s.hackathon?.title || '—',
    hackathonSlug: s.hackathon?.slug || null,
    status: s.status,
    submittedAt: s.submittedAt,
  }));

  return {
    submissions: data,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  };
};

export default { listAllTeams, listAllSubmissions };
