import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import Card, { ICard } from '../models/card';
import NotFoundError from '../helpers/errors/NotFoundError';
import ClientError from '../helpers/errors/ClientError';
import ForbiddenError from '../helpers/errors/ForbiddenError';

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards: ICard[] = await Card.find({});
    res.send({ data: cards });
  } catch (error) {
    next(error);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, link } = req.body;
    const userId = req.user._id;

    const card: ICard = await Card.create({ name, link, owner: userId });
    res.send({ data: card });
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      next(new ClientError('Переданы некорректные данные при создании карточки'));
    } else {
      next(error);
    }
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;

    const card: ICard | null = await Card.findById(cardId);

    if (card?.owner.toString() !== req.user._id) {
      next(new ForbiddenError('Недостаточно прав'));
    }

    const result = await Card.deleteOne({ _id: cardId });

    if (result.deletedCount === 0) {
      next(new NotFoundError('Карточка не найдена'));
    }
    res.send({ message: 'Карточка удалена' });
  } catch (error) {
    if (error instanceof Error.CastError) {
      next(new ClientError('Некорректный идентификатор карточки'));
    } else {
      next(error);
    }
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const userId = req.user._id;

    const card: ICard | null = await Card
      .findByIdAndUpdate(cardId, { $addToSet: { likes: userId } }, { new: true })
      .orFail(() => new NotFoundError('Передан несуществующий _id карточки'));

    res.send({ data: card });
  } catch (error) {
    if (error instanceof Error.CastError) {
      next(new ClientError('Некорректный идентификатор карточки'));
    } else {
      next(error);
    }
  }
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const userId = req.user._id;

    const card: ICard | null = await Card
      .findByIdAndUpdate(cardId, { $pull: { likes: userId } }, { new: true })
      .orFail(() => new NotFoundError('Передан несуществующий _id карточки'));

    res.send({ data: card });
  } catch (error) {
    if (error instanceof Error.CastError) {
      next(new ClientError('Некорректный идентификатор карточки'));
    } else {
      next(error);
    }
  }
};
