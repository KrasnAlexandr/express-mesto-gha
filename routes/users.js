const users = require('express').Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  getCurrentUser,
} = require('../controllers/users');

users.get('/', getAllUsers);
users.get('/me', getCurrentUser);
users.get('/:userId', getUserById);

users.post('/', createUser);

users.patch('/me', updateUserInfo);

users.patch('/me/avatar', updateUserAvatar);

module.exports = users;
