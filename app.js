const express = require('express');
const cookieParser = require('cookie-parser');
const { mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const auth = require('./middlewares/auth');
const users = require('./routes/users');
const cards = require('./routes/cards');
const { createUser, login, logout } = require('./controllers/users');
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
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use(cors({
  origin: [
    'https://mesto.alexred.nomoredomainsclub.ru',
    'http://localhost:3000',
    'https://web.postman.co',
  ],
  credentials: true,
}));

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

app.post('/signout', logout);

app.use('/users', auth, users);
app.use('/cards', auth, cards);

app.use('*', (req, res, next) => {
  next(new NotFoundError('По вашему запросу ничего не найдено'));
}); // должен быть последним

app.use(errorLogger);

app.use(errors());
app.use(error);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
