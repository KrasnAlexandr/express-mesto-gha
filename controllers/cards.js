const Card = require('../models/card');

const getAllCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send(cards))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => res.send(newCard))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    res.status(400).send(({ message: `Указан некорректный id: ${cardId} карточки.` }));
    return;
  }

  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        res.status(404).send({ message: `Карточка с указанным id: ${cardId} не найдена.` });
      } else {
        res.status(200).send({ message: 'Карточка была удалена' });
      }
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const likeCard = (req, res) => {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    res.status(400).send(({ message: `Указан некорректный id: ${cardId} карточки.` }));
    return;
  }

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send(({ message: `Передан несуществующий id: ${cardId} карточки.` }));
      } else {
        res.send(card);
      }
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const dislikeCard = (req, res) => {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    res.status(400).send(({ message: `Указан некорректный id: ${cardId} карточки.` }));
    return;
  }

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        res.status(404).send(({ message: `Передан несуществующий id: ${cardId} карточки.` }));
      } else {
        res.send(card);
      }
    })
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports = {
  getAllCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
