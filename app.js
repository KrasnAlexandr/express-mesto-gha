const express = require('express');
const helmet = require('helmet');
const { mongoose } = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const rateLimit = require('express-rate-limit');

const users = require('./routes/users');
const cards = require('./routes/cards');

const {
  createUser,
  login,
  unauthorized,
} = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

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
      avatar: Joi.string().pattern(/^(https?:\/\/)?(w{3}\.)?[a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

app.post('/signout', unauthorized);

app.use(auth);

app.use('/users', users);
app.use('/cards', cards);
app.use('*', (req, res) => {
  res.status(404).send({ message: 'По вашему запросу ничего не найдено' });
}); // должен быть последним

app.use(errors());

app.use((err, req, res, next) => {
  if (err.statusCode) {
    res.status(err.statusCode).send({ message: err.message });
  } else {
    res.status(500).send({ message: `На сервере произошла ошибка': ${err.message}` });
  }
  next();
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
