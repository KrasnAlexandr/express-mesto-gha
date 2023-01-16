const express = require('express');
const { mongoose } = require('mongoose');
const bodyParser = require('body-parser');

const users = require('./routes/users');
const cards = require('./routes/cards');

const { PORT = 3000 } = process.env;

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

const app = express();

app.use((req, res, next) => {
  req.user = { _id: '63ba7ddc62d0e3182c5d0a28' };
  next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', users);
app.use('/cards', cards);
app.use('*', (req, res) => {
  res.status(404).send({ message: 'По вашему запросу ничего не найдено' });
}); // должен быть последним

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
