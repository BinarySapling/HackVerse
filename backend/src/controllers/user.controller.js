import userService from '../services/user.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import HttpStatus from '../constants/httpStatus.js';

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return ApiResponse.success(
    res,
    HttpStatus.OK,
    'Users retrieved successfully',
    result.users,
    result.pagination
  );
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMyProfile(
    req.user.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    },
    req.file
  );
  return ApiResponse.success(res, HttpStatus.OK, 'Profile updated successfully', user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUserByAdmin(req.params.id, req.user.id, {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
  });
  return ApiResponse.success(res, HttpStatus.OK, 'User updated successfully', user);
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserBlocked(req.params.id, req.user.id, true);
  return ApiResponse.success(res, HttpStatus.OK, 'User blocked', user);
});

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserBlocked(req.params.id, req.user.id, false);
  return ApiResponse.success(res, HttpStatus.OK, 'User unblocked', user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);
  return ApiResponse.success(res, HttpStatus.OK, 'User deleted');
});

export default {
  listUsers,
  updateMe,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
};
