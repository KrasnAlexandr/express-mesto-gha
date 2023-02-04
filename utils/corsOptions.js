const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

const allowedCors = [
  'https://mesto.alexred.nomoredomainsclub.ru/',
  'http://localhost:3000',
  'https://web.postman.co',
];

module.exports = {
  allowedCors,
  DEFAULT_ALLOWED_METHODS,
};
