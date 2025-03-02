import { Request, Response, NextFunction } from 'express';
import Card, { ICard } from '../models/card';
import { NotFoundError, ClientError } from '../helpers/errors';

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

    if (!name || !link) {
      throw new ClientError('Переданы некорректные данные при создании карточки');
    }

    const card: ICard = await Card.create({ name, link, owner: userId });
    res.send({ data: card });
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;

    const result = await Card.deleteOne({ _id: cardId });

    if (result.deletedCount === 0) {
      throw new NotFoundError('Карточка не найдена');
    }
    res.send({ message: 'Карточка удалена' });
  } catch (error) {
    next(error);
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const userId = req.user._id;

    if (!userId) {
      throw new ClientError('Переданы некорректные данные для постановки лайка');
    }

    const card: ICard | null = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!card) {
      throw new ClientError('Передан несуществующий _id карточки');
    }

    res.send({ message: 'Лайк поставлен' });
  } catch (error) {
    next(error);
  }
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const userId = req.user._id;

    if (!cardId) {
      throw new NotFoundError('Передан несуществующий _id карточки');
    }

    if (!userId) {
      throw new ClientError('Переданы некорректные данные для снятия лайка');
    }

    const card: ICard | null = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!card) {
      throw new ClientError('Передан несуществующий _id карточки');
    }

    res.send({ message: 'Лайк снят' });
  } catch (error) {
    next(error);
  }
};
