import Registration from '../models/Registration.js';

export const create = async (data) => {
  return Registration.create(data);
};

export const findByUserAndHackathon = async (userId, hackathonId) => {
  return Registration.findOne({ user: userId, hackathon: hackathonId, isDeleted: false });
};

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

export const countMyRegistrations = async (userId) => {
  return Registration.countDocuments({ user: userId, isDeleted: false });
};

export const findById = async (id) => {
  return Registration.findById(id)
    .populate('hackathon')
    .populate('user', 'firstName lastName email');
};

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
