import Team from '../models/Team.js';

export const create = async (data) => {
  return Team.create(data);
};

export const findById = async (id) => {
  return Team.findOne({ _id: id, isDeleted: false })
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar')
    .populate('hackathon');
};

export const findByLeader = async (leaderId, hackathonId) => {
  return Team.findOne({ leader: leaderId, hackathon: hackathonId, isDeleted: false });
};

export const findByMember = async (memberId, hackathonId) => {
  return Team.findOne({ members: memberId, hackathon: hackathonId, isDeleted: false })
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');
};

export const findByHackathon = async (hackathonId) => {
  return Team.find({ hackathon: hackathonId, isDeleted: false });
};

export const existsByNameInHackathon = async (name, hackathonId) => {
  const count = await Team.countDocuments({
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    hackathon: hackathonId,
    isDeleted: false
  });
  return count > 0;
};

export const addMember = async (teamId, memberId) => {
  return Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: memberId } },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');
};

export const removeMember = async (teamId, memberId) => {
  return Team.findByIdAndUpdate(
    teamId,
    { $pull: { members: memberId } },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');
};

export const softDelete = async (teamId) => {
  return Team.findByIdAndUpdate(
    teamId,
    { isDeleted: true },
    { returnDocument: 'after' }
  );
};

export default {
  create,
  findById,
  findByLeader,
  findByMember,
  findByHackathon,
  existsByNameInHackathon,
  addMember,
  removeMember,
  softDelete
};
