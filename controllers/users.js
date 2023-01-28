const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const RequestConflictError = require('../errors/RequestConflictError');

const getAllUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => next(err));
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  if (userId.length !== 24) {
    next(new BadRequestError(`Указан некорректный id: ${userId} пользователя.`));
    return;
  }

  User.findById({ userId })
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь по указанному id: ${userId} не найден.`));
      } else {
        res.status(200).send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError(`Указан некорректный id: ${userId} пользователя.`));
      } else {
        next(err);
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    next(new BadRequestError('Не передан email или пароль'));
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        next(new RequestConflictError(`Пользователь с почтой ${email} уже зарегистрирован`));
      } else {
        bcrypt.hash(req.body.password, 10)
          .then((hash) => {
            User.create({
              name,
              about,
              avatar,
              email,
              password: hash,
            })
              .then((newUser) => res.send({
                _id: newUser._id,
                name: newUser.name,
                about: newUser.about,
                avatar,
                email: newUser.email,
              }))
              .catch((err) => {
                if (err.name === 'ValidationError') {
                  next(new BadRequestError('Переданы некорректные данные'));
                } else {
                  next(err);
                }
              });
          })
          .catch((err) => next(err));
      }
    });
};

const updateUserInfo = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь с указанным id: ${req.user._id} не найден.`));
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(req.user._id, { ...req.body }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        next(new NotFoundError(`Пользователь с указанным id: ${req.user._id} не найден.`));
      } else {
        res.send(user);
      }
    })
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

  if (!email || !password) {
    next(new BadRequestError('Не получен email или пароль'));
  }

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError(`Пользователь с почтой ${email} не найден`);
      }
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 3600000 * 24 * 7,
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректный запрос'));
      } else {
        next(err);
      }
    });
};
const getCurrentUser = (req, res, next) => {
  const { userId } = req.user._id;

  User.findById({ userId })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(({ message: `Пользователь с указанным id: ${userId} не найден.` }));
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`Указан некорректный id: ${userId} пользователя.`));
      } else {
        next(err);
      }
    });
};

const unauthorized = (req, res) => {
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
  unauthorized,
};
