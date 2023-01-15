const users = require('express').Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateUserAvatar,
} = require('../controllers/users');

users.get('/', getAllUsers);
users.post('/', createUser);

users.get('/:userId', getUserById);

users.patch('/me', updateUserInfo);

users.patch('/me/avatar', updateUserAvatar);

module.exports = users;
