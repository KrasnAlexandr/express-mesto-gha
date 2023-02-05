require('dotenv').config();
const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  } let token = authorization.replace('Bearer ', '');
  try {
    token = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'jwt');
  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
  } req.user = token;
  return next();
};
