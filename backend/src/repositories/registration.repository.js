import Registration from '../models/Registration.js';

/**
 * @desc Create a new registration document
 * @param {Object} data - Registration attributes
 * @returns {Promise<Object>} Created registration document
 */
export const create = async (data) => {
  return Registration.create(data);
};

/**
 * @desc Look up registration for a user matching a specific hackathon
 * @param {string} userId - Object ID of the participant
 * @param {string} hackathonId - Object ID of the hackathon
 * @returns {Promise<Object|null>} Registration document or null
 */
export const findByUserAndHackathon = async (userId, hackathonId) => {
  return Registration.findOne({ user: userId, hackathon: hackathonId, isDeleted: false });
};

/**
 * @desc Fetch registrations of a specific user with paginated hackathon details populated
 * @param {string} userId - Object ID of the participant
 * @param {number} skip - Offset skip number
 * @param {number} limit - Size page limit
 * @returns {Promise<Array>} List of registration documents
 */
export const findMyRegistrations = async (userId, skip, limit) => {
  return Registration.find({ user: userId, isDeleted: false })
    .populate({
      path: 'hackathon',
      select: 'title slug tagline banner registrationStart registrationEnd hackathonStart hackathonEnd status visibility'
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

/**
 * @desc Count active registrations of a specific user
 * @param {string} userId - Object ID of the participant
 * @returns {Promise<number>} Total registrations count
 */
export const countMyRegistrations = async (userId) => {
  return Registration.countDocuments({ user: userId, isDeleted: false });
};

/**
 * @desc Find a registration by Object ID (populating user and hackathon context)
 * @param {string} id - Object ID of the registration document
 * @returns {Promise<Object|null>} Registration document or null
 */
export const findById = async (id) => {
  return Registration.findById(id)
    .populate('hackathon')
    .populate('user', 'firstName lastName email');
};

/**
 * @desc Update the status property of a registration (e.g. set to 'cancelled')
 * @param {string} id - Object ID of the registration document
 * @param {string} status - Target status string
 * @returns {Promise<Object|null>} Updated registration document
 */
export const updateStatus = async (id, status) => {
  return Registration.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
};

export default {
  create,
  findByUserAndHackathon,
  findMyRegistrations,
  countMyRegistrations,
  findById,
  updateStatus
};
