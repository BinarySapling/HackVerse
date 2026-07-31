import Submission from '../models/Submission.js';

export const create = async (data) => {
  return Submission.create(data);
};

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

export const findByTeam = async (teamId) => {
  return Submission.findOne({ team: teamId, isDeleted: false });
};

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

export const count = async (filter) => {
  return Submission.countDocuments(filter);
};

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
