require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const users = require('./routes/users');
const cards = require('./routes/cards');
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const NotFoundError = require('./errors/NotFoundError');
const error = require('./middlewares/error');
const { validateRegex } = require('./utils/validateRegex');
const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

const { PORT = 3000 } = process.env;
const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
  }),
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(cors({
  origin: [
    'https://mesto.alexred.nomoredomainsclub.ru',
    'http://mesto.alexred.nomoredomainsclub.ru',
    'http://localhost:3000',
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);
app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().custom(validateRegex, 'custom validation'),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

app.use(auth);

app.use('/users', users);
app.use('/cards', cards);

app.use('*', (req, res, next) => {
  next(new NotFoundError('По вашему запросу ничего не найдено'));
}); // должен быть последним

app.use(errorLogger);

app.use(errors());
app.use(error);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
