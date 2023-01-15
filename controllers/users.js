const User = require('../models/user');

const getAllUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const getUserById = (req, res) => {
  const { userId } = req.params;

  if (userId.length !== 24) {
    res.status(400).send(({ message: `Указан некорректный id: ${userId} пользователя.` }));
    return;
  }

  User.findById(userId)
    .then((user) => {
      if (!user) {
        res.status(404).send(({ message: `Пользователь по указанному id: ${userId} не найден.` }));
      } else {
        res.send(user);
      }
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const createUser = (req, res) => {
  User.create({ ...req.body })
    .then((newUser) => res.send(newUser))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const updateUserInfo = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(404).send(({ message: `Пользователь с указанным id: ${req.user._id} не найден.` }));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const updateUserAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        res.status(404).send(({ message: `Пользователь с указанным id: ${req.user._id} не найден.` }));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateUserAvatar,
};
