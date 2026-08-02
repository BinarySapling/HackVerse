import Hackathon from '../models/Hackathon.js';
import User from '../models/User.js';
import Registration from '../models/Registration.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import Evaluation from '../models/Evaluation.js';
import Invitation from '../models/Invitation.js';
import Roles from '../constants/roles.js';
import AppError from '../errors/AppError.js';
import HttpStatus from '../constants/httpStatus.js';
import ErrorCodes from '../errors/ErrorCodes.js';

export const getDashboardStats = async (userId, userRole) => {
  if (userRole === Roles.ORGANIZER || userRole === Roles.ADMIN) {
    const hackathonFilter = userRole === Roles.ADMIN
      ? { isDeleted: false }
      : { organizer: userId, isDeleted: false };

    const hackathons = await Hackathon.find(hackathonFilter).select('_id judges winnersAnnounced');
    const hackathonIds = hackathons.map((h) => h._id);

    const statsQueries = [
      Team.countDocuments({ hackathon: { $in: hackathonIds }, isDeleted: false }),
      Submission.countDocuments({ hackathon: { $in: hackathonIds }, isDeleted: false }),
      Invitation.countDocuments({
        hackathon: { $in: hackathonIds },
        status: 'pending',
        expiresAt: { $gt: new Date() }
      }),
      Hackathon.countDocuments({ ...hackathonFilter, winnersAnnounced: true })
    ];

    if (userRole === Roles.ADMIN) {
      statsQueries.push(User.countDocuments({ isDeleted: false }));
    }

    const results = await Promise.all(statsQueries);
    const [registeredTeams, submissions, pendingInvitations, winners] = results;
    const totalUsers = userRole === Roles.ADMIN ? results[4] : undefined;

    const judges = new Set();
    hackathons.forEach((h) => (h.judges || []).forEach((j) => judges.add(j.toString())));

    return {
      role: userRole,
      totalHackathons: hackathons.length,
      registeredTeams,
      judges: judges.size,
      pendingInvitations,
      submissions,
      winners,
      ...(totalUsers !== undefined && { totalUsers }),
    };
  }

  if (userRole === Roles.JUDGE) {
    const assignedHackathons = await Hackathon.find({
      judges: userId,
      isDeleted: false
    }).select('_id title evaluationClosed');

    const hackathonIds = assignedHackathons.map((h) => h._id);
    const submissions = await Submission.find({
      hackathon: { $in: hackathonIds },
      isDeleted: false
    }).select('_id');

    const submissionIds = submissions.map((s) => s._id);
    const completedEvaluations = await Evaluation.countDocuments({
      judge: userId,
      submission: { $in: submissionIds }
    });

    return {
      role: userRole,
      assignedHackathons: assignedHackathons.length,
      pendingEvaluations: Math.max(submissionIds.length - completedEvaluations, 0),
      completedEvaluations,
      hackathons: assignedHackathons
    };
  }

  if (userRole === Roles.PARTICIPANT) {
    const registrations = await Registration.find({
      user: userId,
      status: 'registered',
      isDeleted: false
    }).populate('hackathon', 'title hackathonEnd submissionDeadline submissionStart registrationEnd');

    const teams = await Team.find({
      members: userId,
      isDeleted: false
    }).populate('hackathon', 'title');

    const teamIds = teams.map((t) => t._id);
    const submissions = await Submission.find({
      team: { $in: teamIds },
      isDeleted: false
    }).select('team status hackathon');

    const teamHackathonMap = new Map(
      teams.map((t) => [t._id.toString(), t.hackathon?._id || t.hackathon])
    );
    const submissionReviews = submissions.map((s) => ({
      hackathonId: teamHackathonMap.get(s.team.toString()),
      status: s.status || 'pending'
    })).filter((item) => item.hackathonId);

    const upcomingDeadlines = registrations
      .map((r) => r.hackathon)
      .filter(Boolean)
      .map((h) => ({
        hackathonId: h._id,
        title: h.title,
        registrationEnd: h.registrationEnd,
        submissionDeadline: h.submissionDeadline || h.hackathonEnd
      }))
      .sort((a, b) => new Date(a.submissionDeadline) - new Date(b.submissionDeadline))
      .slice(0, 5);

    return {
      role: userRole,
      registeredHackathons: registrations.length,
      teams: teams.length,
      upcomingDeadlines,
      submissionStatus: {
        submitted: submissions.length,
        pending: Math.max(teams.length - submissions.length, 0)
      },
      submissionReviews
    };
  }

  throw new AppError('Unsupported role for dashboard stats', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
};

export default { getDashboardStats };
