require('dotenv').config();
const JWToken = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const auth = (req, res, next) => {
  const { jwt } = req.cookies;
  const { NODE_ENV, JWT_SECRET } = process.env;

  try {
    if (!jwt) {
      throw new UnauthorizedError('C токеном что-то не так');
    }
  } catch (err) {
    next(err);
  }

  try {
    JWToken.verify(jwt, NODE_ENV === 'production' ? JWT_SECRET : 'jwt', (err, decoded) => {
      if (err) {
        throw new UnauthorizedError('Необходима авторизация');
      }
      req.user = decoded;
      next();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
