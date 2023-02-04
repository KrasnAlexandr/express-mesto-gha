const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const RequestConflictError = require('../errors/RequestConflictError');

const getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => next(err));
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail(new NotFoundError(`Пользователь по указанному id: ${userId} не найден.`))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(`Указан некорректный id: ${userId} пользователя.`));
      } else {
        next(err);
      }
    });
};

const createUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  try {
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, password: hashPassword, name, about, avatar,
    });
    res.status(200).send({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    if (err.name === 'MongoServerError' && err.code === 11000) {
      next(new RequestConflictError(`Пользователь с почтой ${email} уже зарегистрирован`));
    } else if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные'));
    } else {
      next(err);
    }
  }
};

const updateUserInfo = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .orFail(new NotFoundError(`Пользователь с указанным id: ${req.user._id} не найден.`))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .orFail(new NotFoundError(`Пользователь с указанным id: ${req.user._id} не найден.`))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.status(200).cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24 * 7,
      })
        .send({ message: 'Пользователь авторизован!' });
    })
    .catch((err) => next(err));
};
const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(new NotFoundError({ message: `Пользователь с указанным id: ${req.user._id} не найден.` }))
    .then((user) => res.status(200).send(user))
    .catch((err) => next(err));
};

const logout = (req, res) => {
  const token = '';
  res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: true,
    maxAge: 3600000 * 24 * 7,
  });
  res.send({ token, message: 'Выход выполнен' });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserInfo,
  updateUserAvatar,
  login,
  getCurrentUser,
  logout,
};
