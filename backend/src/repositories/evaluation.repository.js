import Evaluation from '../models/Evaluation.js';

/**
 * @desc Save a new evaluation document
 * @param {Object} data - Evaluation parameters
 * @returns {Promise<Object>} Created Evaluation document
 */
export const create = async (data) => {
  return Evaluation.create(data);
};

/**
 * @desc Fetch an evaluation by its Object ID
 * @param {string} id - Object ID of the evaluation
 * @returns {Promise<Object|null>} Populated Evaluation document or null
 */
export const findById = async (id) => {
  return Evaluation.findById(id)
    .populate('judge', 'firstName lastName email avatar')
    .populate({
      path: 'submission',
      populate: {
        path: 'team',
        select: 'name leader members'
      }
    })
    .populate('hackathon');
};

/**
 * @desc Fetch a single evaluation document matching custom filters
 * @param {Object} filter - Database filter criteria
 * @returns {Promise<Object|null>} Evaluation document or null
 */
export const findOne = async (filter) => {
  return Evaluation.findOne(filter);
};

/**
 * @desc Fetch multiple evaluations with sorting, pagination, and populate configurations
 * @param {Object} filter - Database query filters
 * @param {Object} sort - Query sorting parameters
 * @param {number} skip - Offset skip count
 * @param {number} limit - Size page count
 * @returns {Promise<Array>} List of Evaluation documents
 */
export const findAll = async (filter, sort, skip, limit) => {
  return Evaluation.find(filter)
    .populate('judge', 'firstName lastName email avatar')
    .populate({
      path: 'submission',
      populate: {
        path: 'team',
        select: 'name leader'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

/**
 * @desc Count evaluations matching database criteria
 * @param {Object} filter - Database query filters
 * @returns {Promise<number>} Match count
 */
export const count = async (filter) => {
  return Evaluation.countDocuments(filter);
};

/**
 * @desc Update evaluation values
 * @param {string} id - Object ID of the evaluation
 * @param {Object} updateData - Properties update payload
 * @returns {Promise<Object|null>} Updated and populated Evaluation document
 */
export const update = async (id, updateData) => {
  return Evaluation.findByIdAndUpdate(id, updateData, {
    returnDocument: 'after',
    runValidators: true
  })
    .populate('judge', 'firstName lastName email avatar')
    .populate({
      path: 'submission',
      populate: {
        path: 'team',
        select: 'name leader'
      }
    });
};

export default {
  create,
  findById,
  findOne,
  findAll,
  count,
  update
};
