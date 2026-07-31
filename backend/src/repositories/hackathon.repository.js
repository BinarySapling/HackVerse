import Hackathon from '../models/Hackathon.js';

export const create = async (data) => {
  return Hackathon.create(data);
};

export const findById = async (id) => {
  return Hackathon.findById(id).populate('organizer', 'firstName lastName email avatar');
};

export const findBySlug = async (slug) => {
  return Hackathon.findOne({ slug, isDeleted: false }).populate('organizer', 'firstName lastName email avatar');
};

export const findBySlugOrId = async (slugOrId) => {
  const bySlug = await findBySlug(slugOrId);
  if (bySlug) return bySlug;
  if (/^[a-f\d]{24}$/i.test(slugOrId)) {
    const byId = await findById(slugOrId);
    if (byId && !byId.isDeleted) return byId;
  }
  return null;
};

export const findAll = async (filter, sort, skip, limit) => {
  return Hackathon.find(filter)
    .select('title slug tagline description banner organizer registrationStart registrationEnd hackathonStart hackathonEnd submissionStart submissionDeadline minTeamSize maxTeamSize maxTeams prizePool status visibility contactEmail rules judges evaluationClosed winnersAnnounced createdAt')
    .populate('organizer', 'firstName lastName email avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const count = async (filter) => {
  return Hackathon.countDocuments(filter);
};

export const update = async (id, updateData) => {
  return Hackathon.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
};

export const softDelete = async (id) => {
  return Hackathon.findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' });
};

export const existsBySlug = async (slug) => {
  const documentCount = await Hackathon.countDocuments({ slug });
  return documentCount > 0;
};

export const addJudge = async (hackathonId, judgeId) => {
  return Hackathon.findByIdAndUpdate(
    hackathonId,
    { $addToSet: { judges: judgeId } },
    { returnDocument: 'after', runValidators: true }
  );
};

export default {
  create,
  findById,
  findBySlug,
  findBySlugOrId,
  findAll,
  count,
  update,
  softDelete,
  existsBySlug,
  addJudge
};
