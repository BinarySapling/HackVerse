import Team from '../models/Team.js';

/**
 * @desc Create a new team document
 * @param {Object} data - Team attributes
 * @returns {Promise<Object>} Created team document
 */
export const create = async (data) => {
  return Team.create(data);
};

/**
 * @desc Fetch active team properties by Object ID
 * @param {string} id - Object ID of the team
 * @returns {Promise<Object|null>} Populated Team document or null
 */
export const findById = async (id) => {
  return Team.findOne({ _id: id, isDeleted: false })
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar')
    .populate('hackathon');
};

/**
 * @desc Fetch active team where a specific user is the leader
 * @param {string} leaderId - Object ID of the user
 * @param {string} hackathonId - Object ID of the hackathon
 * @returns {Promise<Object|null>} Team document or null
 */
export const findByLeader = async (leaderId, hackathonId) => {
  return Team.findOne({ leader: leaderId, hackathon: hackathonId, isDeleted: false });
};

/**
 * @desc Fetch active team containing a specific member inside the hackathon
 * @param {string} memberId - Object ID of the user
 * @param {string} hackathonId - Object ID of the hackathon
 * @returns {Promise<Object|null>} Populated Team document or null
 */
export const findByMember = async (memberId, hackathonId) => {
  return Team.findOne({ members: memberId, hackathon: hackathonId, isDeleted: false })
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');
};

/**
 * @desc Fetch all active teams registered under a hackathon
 * @param {string} hackathonId - Object ID of the hackathon
 * @returns {Promise<Array>} List of Team documents
 */
export const findByHackathon = async (hackathonId) => {
  return Team.find({ hackathon: hackathonId, isDeleted: false });
};

/**
 * @desc Verify case-insensitive team name uniqueness within a specific hackathon
 * @param {string} name - Proposed team name
 * @param {string} hackathonId - Object ID of the hackathon
 * @returns {Promise<boolean>} True if name exists, false otherwise
 */
export const existsByNameInHackathon = async (name, hackathonId) => {
  const count = await Team.countDocuments({
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    hackathon: hackathonId,
    isDeleted: false
  });
  return count > 0;
};

/**
 * @desc Add a member to a team's members array
 * @param {string} teamId - Object ID of the team
 * @param {string} memberId - Object ID of the user to append
 * @returns {Promise<Object|null>} Updated and populated Team document
 */
export const addMember = async (teamId, memberId) => {
  return Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: memberId } },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');
};

/**
 * @desc Pull a member from a team's members array
 * @param {string} teamId - Object ID of the team
 * @param {string} memberId - Object ID of the user to pull
 * @returns {Promise<Object|null>} Updated and populated Team document
 */
export const removeMember = async (teamId, memberId) => {
  return Team.findByIdAndUpdate(
    teamId,
    { $pull: { members: memberId } },
    { returnDocument: 'after', runValidators: true }
  )
    .populate('leader', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');
};

/**
 * @desc Perform a soft-delete by setting isDeleted = true
 * @param {string} teamId - Object ID of the team
 * @returns {Promise<Object|null>} Updated Team document
 */
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
