import Submission from '../models/Submission.js';

/**
 * @desc Create a new project submission
 * @param {Object} data - Submission parameters
 * @returns {Promise<Object>} Created Submission document
 */
export const create = async (data) => {
  return Submission.create(data);
};

/**
 * @desc Fetch active submission details by Object ID
 * @param {string} id - Object ID of the submission
 * @returns {Promise<Object|null>} Populated Submission document or null
 */
export const findById = async (id) => {
  return Submission.findOne({ _id: id, isDeleted: false })
    .populate({
      path: 'team',
      populate: {
        path: 'leader members',
        select: 'firstName lastName email'
      }
    })
    .populate('hackathon');
};

/**
 * @desc Fetch active submission matching a specific team ID
 * @param {string} teamId - Object ID of the team
 * @returns {Promise<Object|null>} Submission document or null
 */
export const findByTeam = async (teamId) => {
  return Submission.findOne({ team: teamId, isDeleted: false });
};

/**
 * @desc Fetch filtered, sorted, and paginated submissions
 * @param {Object} filter - Query filter conditions
 * @param {Object} sort - Query sorting parameters
 * @param {number} skip - Offset skip number
 * @param {number} limit - Size page limit
 * @returns {Promise<Array>} List of Submission documents
 */
export const findAll = async (filter, sort, skip, limit) => {
  return Submission.find(filter)
    .populate({
      path: 'team',
      select: 'name leader members',
      populate: {
        path: 'leader',
        select: 'firstName lastName email'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * @desc Count active submissions matching filter criteria
 * @param {Object} filter - Query filter conditions
 * @returns {Promise<number>} Count of matched documents
 */
export const count = async (filter) => {
  return Submission.countDocuments(filter);
};

/**
 * @desc Update submission properties
 * @param {string} id - Object ID of the submission
 * @param {Object} updateData - Properties update payload
 * @returns {Promise<Object|null>} Updated Submission document
 */
export const update = async (id, updateData) => {
  return Submission.findByIdAndUpdate(
    id,
    updateData,
    { returnDocument: 'after', runValidators: true }
  ).populate({
    path: 'team',
    populate: {
      path: 'leader members',
      select: 'firstName lastName email'
    }
  });
};

/**
 * @desc Perform a soft-delete on a submission document
 * @param {string} id - Object ID of the submission
 * @returns {Promise<Object|null>} Updated Submission document
 */
export const softDelete = async (id) => {
  return Submission.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { returnDocument: 'after' }
  );
};

export default {
  create,
  findById,
  findByTeam,
  findAll,
  count,
  update,
  softDelete
};
