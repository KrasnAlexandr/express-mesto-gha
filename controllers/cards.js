const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

const getAllCards = (req, res, next) => {
  Card.find({}).populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch((err) => next(err));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((newCard) => newCard.populate('owner', 'likes'))
    .then((newCard) => res.status(201).send(newCard))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    next(new BadRequestError(`Указан некорректный id: ${cardId} карточки.`));
    return;
  }

  Card.findByIdAndRemove(cardId)
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        next(new NotFoundError(`Карточка с указанным id: ${cardId} не найдена.`));
      }

      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Отсутствуют права на удаление этой карточки');
      }

      res.status(200).send({ message: 'Карточка была удалена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new NotFoundError('Некорректный запрос'));
      } else {
        next(err);
      }
    });
};

const likeCard = (req, res, next) => {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    next(new BadRequestError(`Указан некорректный id: ${cardId} карточки.`));
    return;
  }

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        next(new NotFoundError(`Передан несуществующий id: ${cardId} карточки.`));
      } else {
        res.send(card);
      }
    })
    .catch((err) => next(err));
};

const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  if (cardId.length !== 24) {
    next(new BadRequestError(`Указан некорректный id: ${cardId} карточки.`));
    return;
  }

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        next(new NotFoundError(`Передан несуществующий id: ${cardId} карточки.`));
      } else {
        res.send(card);
      }
    })
    .catch((err) => next(err));
};

module.exports = {
  getAllCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
