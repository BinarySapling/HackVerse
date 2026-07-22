import Hackathon from '../models/Hackathon.js';

/**
 * @desc Create a new hackathon document
 * @param {Object} data - Hackathon properties
 * @returns {Promise<Object>} Created Hackathon document
 */
export const create = async (data) => {
  return Hackathon.create(data);
};

/**
 * @desc Retrieve hackathon details by ID, populating organizer profile fields
 * @param {string} id - Hackathon document Object ID
 * @returns {Promise<Object|null>} Hackathon document or null
 */
export const findById = async (id) => {
  return Hackathon.findById(id).populate('organizer', 'firstName lastName email avatar');
};

/**
 * @desc Retrieve active hackathon details by unique URL slug string
 * @param {string} slug - Unique URL slug
 * @returns {Promise<Object|null>} Hackathon document or null
 */
export const findBySlug = async (slug) => {
  return Hackathon.findOne({ slug, isDeleted: false }).populate('organizer', 'firstName lastName email avatar');
};

/**
 * @desc Retrieve filtered, sorted, and paginated hackathon listings (with performance-tuned projections)
 * @param {Object} filter - Query filter criteria
 * @param {Object} sort - Query sort parameter mappings
 * @param {number} skip - Skip documents index
 * @param {number} limit - Limit documents count
 * @returns {Promise<Array>} List of Hackathon documents
 */
export const findAll = async (filter, sort, skip, limit) => {
  return Hackathon.find(filter)
    .select('title slug tagline description banner organizer registrationStart registrationEnd hackathonStart hackathonEnd minTeamSize maxTeamSize status visibility contactEmail rules judges createdAt')
    .populate('organizer', 'firstName lastName email avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * @desc Count active documents matching filter criteria (for pagination metadata checks)
 * @param {Object} filter - Query filter criteria
 * @returns {Promise<number>} Count of matched documents
 */
export const count = async (filter) => {
  return Hackathon.countDocuments(filter);
};

/**
 * @desc Update hackathon document properties
 * @param {string} id - Hackathon document Object ID
 * @param {Object} updateData - Properties update payload
 * @returns {Promise<Object|null>} Updated Hackathon document
 */
export const update = async (id, updateData) => {
  return Hackathon.findByIdAndUpdate(id, updateData, { returnDocument: 'after', runValidators: true });
};

/**
 * @desc Soft-delete a hackathon document by setting isDeleted = true
 * @param {string} id - Hackathon document Object ID
 * @returns {Promise<Object|null>} Updated Hackathon document
 */
export const softDelete = async (id) => {
  return Hackathon.findByIdAndUpdate(id, { isDeleted: true }, { returnDocument: 'after' });
};

/**
 * @desc Check if a unique URL slug already exists in the database
 * @param {string} slug - Unique URL slug string to query
 * @returns {Promise<boolean>} True if slug exists, false otherwise
 */
export const existsBySlug = async (slug) => {
  const documentCount = await Hackathon.countDocuments({ slug });
  return documentCount > 0;
};

export default {
  create,
  findById,
  findBySlug,
  findAll,
  count,
  update,
  softDelete,
  existsBySlug
};
