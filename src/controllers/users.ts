import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import User, { IUser } from '../models/user';
import NotFoundError from '../helpers/errors/NotFoundError';
import ClientError from '../helpers/errors/ClientError';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users: IUser[] = await User.find({});
    res.send({ data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: IUser | null = await User.findById(req.params.userId);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.send({ data: user });
  } catch (error) {
    if (error instanceof Error.CastError) {
      next(new ClientError('Некорректный id пользователя'));
    } else {
      next(error);
    }
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, about, avatar } = req.body;

    const user: IUser = await User.create({ name, about, avatar });
    res.send({ data: user });
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      throw new ClientError('Переданы некорректные данные при создании пользователя');
    } else {
      next(error);
    }
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { name, about } = req.body;

    const result = await User.updateOne({ _id: userId }, { name, about });

    if (result.modifiedCount > 0) {
      res.send({ message: 'Профиль успешно обновлён' });
    } else {
      throw new NotFoundError('Профиль не был обновлён');
    }
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      throw new ClientError('Переданы некорректные данные при обновлении пользователя');
    } else {
      next(error);
    }
  }
};

export const updateUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { avatar } = req.body;

    const result = await User.updateOne({ _id: userId }, { avatar });

    if (result.modifiedCount > 0) {
      res.send({ message: 'Аватар успешно обновлён' });
    } else {
      throw new NotFoundError('Аватар не был обновлён');
    }
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      throw new ClientError('Переданы некорректные данные при обновлении аватара');
    } else {
      next(error);
    }
  }
};
