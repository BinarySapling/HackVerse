import Evaluation from '../models/Evaluation.js';

export const create = async (data) => {
  return Evaluation.create(data);
};

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

export const findOne = async (filter) => {
  return Evaluation.findOne(filter);
};

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

export const count = async (filter) => {
  return Evaluation.countDocuments(filter);
};

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
